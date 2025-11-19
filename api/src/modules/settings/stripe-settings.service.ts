import { EncryptionService } from '@/common/services/encryption.service';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditTargetType } from '../audit/entities/audit-log.entity';
import { UpdateStripeSettingsDto } from './dto/update-stripe-settings.dto';
import { StripeSetting } from './entities/stripe-setting.entity';
import { StripeSettingsRepository } from './stripe-settings.repository';

@Injectable()
export class StripeSettingsService {
	private readonly logger = new Logger(StripeSettingsService.name);

	constructor(
		private readonly stripeSettingsRepository: StripeSettingsRepository,
		private readonly encryptionService: EncryptionService,
		private readonly auditService: AuditService,
	) { }

	/**
	 * Get Stripe settings (creates default if doesn't exist)
	 */
	async getSettings(): Promise<StripeSetting> {
		return this.stripeSettingsRepository.getOrCreateSettings();
	}

	/**
	 * Get Stripe settings with masked sensitive data for public display
	 */
	async getSettingsMasked(): Promise<StripeSetting> {
		const settings = await this.getSettings();
		// Sensitive keys are already masked by entity methods
		return settings;
	}

	/**
	 * Update Stripe settings
	 */
	async updateSettings(
		updateDto: UpdateStripeSettingsDto,
		adminId?: number,
		adminName?: string,
		ipAddress?: string,
	): Promise<StripeSetting> {
		const settings = await this.stripeSettingsRepository.getOrCreateSettings();

		if (!settings) {
			throw new NotFoundException('Stripe settings not found');
		}

		// Encrypt sensitive data if provided
		const dataToUpdate: Partial<StripeSetting> = { ...updateDto };

		if (updateDto.secretKey) {
			dataToUpdate.secretKeyEncrypted = await this.encryptionService.encrypt(
				updateDto.secretKey,
			);
			delete (dataToUpdate as any).secretKey;
		}

		if (updateDto.webhookSecret) {
			dataToUpdate.webhookSecretEncrypted = await this.encryptionService.encrypt(
				updateDto.webhookSecret,
			);
			delete (dataToUpdate as any).webhookSecret;
		}

		const updatedSettings = await this.stripeSettingsRepository.updateSettings(
			settings.id,
			dataToUpdate,
		);

		if (!updatedSettings) {
			throw new NotFoundException('Failed to update Stripe settings');
		}

		// Create audit log
		if (adminId && adminName) {
			const changedFields = Object.keys(updateDto).filter(
				(key) => updateDto[key] !== undefined,
			);

			// Mask sensitive fields in audit log
			const auditMetadata = { ...updateDto };
			if (auditMetadata.secretKey) {
				auditMetadata.secretKey = '********';
			}
			if (auditMetadata.webhookSecret) {
				auditMetadata.webhookSecret = '********';
			}

			await this.auditService.createLog({
				performedBy: adminId,
				performerName: adminName,
				action: AuditAction.SETTINGS_UPDATED,
				targetType: AuditTargetType.SETTINGS,
				targetId: settings.id.toString(),
				details: `Stripe settings updated: ${changedFields.join(', ')}`,
				ipAddress,
				metadata: {
					settingsType: 'stripe',
					settingsId: settings.id,
					updatedFields: changedFields,
					newValues: auditMetadata,
				},
			});
		}

		return updatedSettings;
	}

	/**
	 * Get decrypted secret key (requires special permission)
	 */
	async getDecryptedSecretKey(): Promise<string | null> {
		const settings = await this.getSettings();

		if (!settings.secretKeyEncrypted) {
			return null;
		}

		try {
			return await this.encryptionService.decrypt(settings.secretKeyEncrypted);
		} catch (error) {
			this.logger.error('Failed to decrypt Stripe secret key', error);
			throw new Error('Failed to decrypt secret key');
		}
	}

	/**
	 * Get decrypted webhook secret (requires special permission)
	 */
	async getDecryptedWebhookSecret(): Promise<string | null> {
		const settings = await this.getSettings();

		if (!settings.webhookSecretEncrypted) {
			return null;
		}

		try {
			return await this.encryptionService.decrypt(settings.webhookSecretEncrypted);
		} catch (error) {
			this.logger.error('Failed to decrypt Stripe webhook secret', error);
			throw new Error('Failed to decrypt webhook secret');
		}
	}

	/**
	 * Test Stripe connection
	 */
	async testConnection(
		adminId?: number,
		adminName?: string,
		ipAddress?: string,
	): Promise<boolean> {
		const settings = await this.getSettings();

		if (!settings.isFullyConfigured()) {
			throw new BadRequestException('Stripe is not fully configured');
		}

		try {
			// TODO: Implement actual Stripe API connection test
			// For now, we'll just validate that keys exist
			const secretKey = await this.getDecryptedSecretKey();

			if (!secretKey || !secretKey.startsWith('sk_')) {
				throw new BadRequestException('Invalid Stripe secret key format');
			}

			// Update connection status
			await this.stripeSettingsRepository.updateSettings(settings.id, {
				lastConnectionTestAt: new Date(),
				lastConnectionSuccessful: true,
				lastConnectionError: null,
			});

			// Log successful test
			if (adminId && adminName) {
				await this.auditService.createLog({
					performedBy: adminId,
					performerName: adminName,
					action: AuditAction.SETTINGS_UPDATED,
					targetType: AuditTargetType.SETTINGS,
					targetId: settings.id.toString(),
					details: 'Stripe connection test successful',
					ipAddress,
					metadata: {
						settingsType: 'stripe',
						testResult: 'success',
					},
				});
			}

			return true;
		} catch (error) {
			const errorMessage = error.message || 'Connection test failed';

			// Update connection status
			await this.stripeSettingsRepository.updateSettings(settings.id, {
				lastConnectionTestAt: new Date(),
				lastConnectionSuccessful: false,
				lastConnectionError: errorMessage,
			});

			// Log failed test
			if (adminId && adminName) {
				await this.auditService.createLog({
					performedBy: adminId,
					performerName: adminName,
					action: AuditAction.SETTINGS_UPDATED,
					targetType: AuditTargetType.SETTINGS,
					targetId: settings.id.toString(),
					details: `Stripe connection test failed: ${errorMessage}`,
					ipAddress,
					metadata: {
						settingsType: 'stripe',
						testResult: 'failed',
						error: errorMessage,
					},
				});
			}

			throw error;
		}
	}

	/**
	 * Check if Stripe subscriptions are enabled and configured
	 */
	async canAcceptPayments(): Promise<boolean> {
		return this.stripeSettingsRepository.areSubscriptionsEnabled();
	}

	/**
	 * Toggle Stripe enabled status
	 */
	async toggleEnabled(
		adminId?: number,
		adminName?: string,
		ipAddress?: string,
	): Promise<StripeSetting> {
		const settings = await this.getSettings();
		const newStatus = !settings.isEnabled;

		const updated = await this.stripeSettingsRepository.updateSettings(settings.id, {
			isEnabled: newStatus,
		});

		// Create audit log
		if (adminId && adminName) {
			await this.auditService.createLog({
				performedBy: adminId,
				performerName: adminName,
				action: AuditAction.SETTINGS_UPDATED,
				targetType: AuditTargetType.SETTINGS,
				targetId: settings.id.toString(),
				details: `Stripe ${newStatus ? 'enabled' : 'disabled'}`,
				ipAddress,
				metadata: {
					settingsType: 'stripe',
					action: 'toggle_enabled',
					newStatus,
				},
			});
		}

		return updated;
	}

	/**
	 * Toggle subscription allowance
	 */
	async toggleSubscriptions(
		adminId?: number,
		adminName?: string,
		ipAddress?: string,
	): Promise<StripeSetting> {
		const settings = await this.getSettings();
		const newStatus = !settings.allowSubscriptions;

		const updated = await this.stripeSettingsRepository.updateSettings(settings.id, {
			allowSubscriptions: newStatus,
		});

		// Create audit log
		if (adminId && adminName) {
			await this.auditService.createLog({
				performedBy: adminId,
				performerName: adminName,
				action: AuditAction.SETTINGS_UPDATED,
				targetType: AuditTargetType.SETTINGS,
				targetId: settings.id.toString(),
				details: `Subscriptions ${newStatus ? 'allowed' : 'disabled'}`,
				ipAddress,
				metadata: {
					settingsType: 'stripe',
					action: 'toggle_subscriptions',
					newStatus,
				},
			});
		}

		return updated;
	}
}
