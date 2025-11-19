import { AbstractRepository } from '@/database/abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StripeSetting } from './entities/stripe-setting.entity';

@Injectable()
export class StripeSettingsRepository extends AbstractRepository<StripeSetting> {
	constructor(
		@InjectRepository(StripeSetting)
		private readonly stripeSettingsRepository: Repository<StripeSetting>,
	) {
		super(stripeSettingsRepository);
	}

	/**
	 * Get Stripe settings or create default if doesn't exist
	 */
	async getOrCreateSettings(): Promise<StripeSetting> {
		let settings = await this.findOne({ where: {} });

		if (!settings) {
			settings = await this.create({
				isEnabled: false,
				allowSubscriptions: true,
				trialPeriodDays: 0,
				allowCancellation: true,
				prorateCharges: true,
				currency: 'usd',
				paymentMethods: ['card'],
				collectTax: false,
			});
		}

		return settings;
	}

	/**
	 * Update Stripe settings
	 */
	async updateSettings(id: number, data: Partial<StripeSetting>): Promise<StripeSetting> {
		await this.update({ id } as any, data);
		return this.findById(id);
	}

	/**
	 * Test if Stripe settings are configured
	 */
	async isConfigured(): Promise<boolean> {
		const settings = await this.getOrCreateSettings();
		return settings.isFullyConfigured();
	}

	/**
	 * Check if subscriptions are enabled
	 */
	async areSubscriptionsEnabled(): Promise<boolean> {
		const settings = await this.getOrCreateSettings();
		return settings.canAcceptPayments();
	}
}
