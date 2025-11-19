import { AbstractEntity } from '@/database/abstract.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('stripe_settings')
@Index(['id'], { unique: true })
export class StripeSetting extends AbstractEntity<StripeSetting> {
	@Column({ name: 'is_enabled', type: 'boolean', default: false })
	isEnabled: boolean;

	@Column({ name: 'publishable_key', type: 'varchar', length: 500, nullable: true })
	publishableKey?: string;

	@Column({ name: 'secret_key_encrypted', type: 'text', nullable: true })
	secretKeyEncrypted?: string;

	@Column({ name: 'webhook_secret_encrypted', type: 'text', nullable: true })
	webhookSecretEncrypted?: string;

	// Subscription Settings
	@Column({ name: 'allow_subscriptions', type: 'boolean', default: true })
	allowSubscriptions: boolean;

	@Column({ name: 'trial_period_days', type: 'integer', default: 0 })
	trialPeriodDays: number;

	@Column({ name: 'allow_cancellation', type: 'boolean', default: true })
	allowCancellation: boolean;

	@Column({ name: 'prorate_charges', type: 'boolean', default: true })
	prorateCharges: boolean;

	// Payment Settings
	@Column({ name: 'currency', type: 'varchar', length: 3, default: 'usd' })
	currency: string;

	@Column({ name: 'payment_methods', type: 'simple-array', default: 'card' })
	paymentMethods: string[];

	// Tax Settings
	@Column({ name: 'collect_tax', type: 'boolean', default: false })
	collectTax: boolean;

	@Column({ name: 'tax_rate_percentage', type: 'decimal', precision: 5, scale: 2, default: 0, nullable: true })
	taxRatePercentage?: number;

	// Connection Status
	@Column({ name: 'last_connection_test_at', type: 'timestamp', nullable: true })
	lastConnectionTestAt?: Date;

	@Column({ name: 'last_connection_successful', type: 'boolean', nullable: true })
	lastConnectionSuccessful?: boolean;

	@Column({ name: 'last_connection_error', type: 'text', nullable: true })
	lastConnectionError?: string;

	// Helper methods
	hasSecretKey(): boolean {
		return !!this.secretKeyEncrypted;
	}

	hasWebhookSecret(): boolean {
		return !!this.webhookSecretEncrypted;
	}

	getMaskedSecretKey(): string {
		if (!this.secretKeyEncrypted) return 'Not configured';
		return 'sk_••••••••••••••••';
	}

	getMaskedWebhookSecret(): string {
		if (!this.webhookSecretEncrypted) return 'Not configured';
		return 'whsec_••••••••••••••••';
	}

	isFullyConfigured(): boolean {
		return !!this.publishableKey && !!this.secretKeyEncrypted;
	}

	canAcceptPayments(): boolean {
		return this.isEnabled && this.allowSubscriptions && this.isFullyConfigured();
	}
}
