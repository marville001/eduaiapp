import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditTargetType } from '../audit/entities/audit-log.entity';
import { CreateSubscriptionPackageDto } from './dto/create-subscription-package.dto';
import { UpdateSubscriptionPackageDto } from './dto/update-subscription-package.dto';
import { PackageType, SubscriptionPackage } from './entities/subscription-package.entity';
import { SubscriptionPackageRepository } from './subscription-package.repository';

@Injectable()
export class SubscriptionPackageService {
	constructor(
		private readonly packageRepository: SubscriptionPackageRepository,
		private readonly auditService: AuditService,
	) { }

	/**
	 * Get all packages
	 */
	async getAllPackages(): Promise<SubscriptionPackage[]> {
		return this.packageRepository.findAll({
			order: { displayOrder: 'ASC', price: 'ASC' },
		});
	}

	/**
	 * Get all active packages
	 */
	async getActivePackages(): Promise<SubscriptionPackage[]> {
		return this.packageRepository.getActivePackages();
	}

	/**
	 * Get all visible packages (for public display)
	 */
	async getVisiblePackages(): Promise<SubscriptionPackage[]> {
		return this.packageRepository.getVisiblePackages();
	}

	/**
	 * Get featured packages
	 */
	async getFeaturedPackages(): Promise<SubscriptionPackage[]> {
		return this.packageRepository.getFeaturedPackages();
	}

	/**
	 * Get package by ID
	 */
	async getPackageById(id: number): Promise<SubscriptionPackage> {
		const pkg = await this.packageRepository.findById(id);

		if (!pkg) {
			throw new NotFoundException(`Subscription package with ID ${id} not found`);
		}

		return pkg;
	}

	/**
	 * Get package by Stripe Price ID
	 */
	async getPackageByStripePriceId(stripePriceId: string): Promise<SubscriptionPackage> {
		const pkg = await this.packageRepository.findByStripePriceId(stripePriceId);

		if (!pkg) {
			throw new NotFoundException(
				`Subscription package with Stripe Price ID ${stripePriceId} not found`,
			);
		}

		return pkg;
	}

	/**
	 * Get packages by type
	 */
	async getPackagesByType(packageType: PackageType): Promise<SubscriptionPackage[]> {
		return this.packageRepository.findByType(packageType);
	}

	/**
	 * Get free package
	 */
	async getFreePackage(): Promise<SubscriptionPackage | null> {
		return this.packageRepository.getFreePackage();
	}

	/**
	 * Create new package
	 */
	async createPackage(
		createDto: CreateSubscriptionPackageDto,
		adminId?: number,
		adminName?: string,
		ipAddress?: string,
	): Promise<SubscriptionPackage> {
		// Validate Stripe Price ID uniqueness if provided
		if (createDto.stripePriceId) {
			const existing = await this.packageRepository.findByStripePriceId(
				createDto.stripePriceId,
			);
			if (existing) {
				throw new BadRequestException(
					'A package with this Stripe Price ID already exists',
				);
			}
		}

		const pkg = await this.packageRepository.create(createDto);

		// Create audit log
		if (adminId && adminName) {
			await this.auditService.createLog({
				performedBy: adminId,
				performerName: adminName,
				action: AuditAction.CREATED,
				targetType: AuditTargetType.SUBSCRIPTION_PACKAGE,
				targetId: pkg.id.toString(),
				details: `Created subscription package: ${pkg.name}`,
				ipAddress,
				metadata: {
					packageId: pkg.id,
					packageName: pkg.name,
					price: pkg.price,
					billingInterval: pkg.billingInterval,
				},
			});
		}

		return pkg;
	}

	/**
	 * Update package
	 */
	async updatePackage(
		id: number,
		updateDto: UpdateSubscriptionPackageDto,
		adminId?: number,
		adminName?: string,
		ipAddress?: string,
	): Promise<SubscriptionPackage> {
		const pkg = await this.getPackageById(id);

		// Validate Stripe Price ID uniqueness if being updated
		if (updateDto.stripePriceId && updateDto.stripePriceId !== pkg.stripePriceId) {
			const existing = await this.packageRepository.findByStripePriceId(
				updateDto.stripePriceId,
			);
			if (existing) {
				throw new BadRequestException(
					'A package with this Stripe Price ID already exists',
				);
			}
		}

		const updated = await this.packageRepository.update({ id } as any, updateDto);

		if (!updated) {
			throw new NotFoundException('Failed to update package');
		}

		// Create audit log
		if (adminId && adminName) {
			const changedFields = Object.keys(updateDto).filter(
				(key) => updateDto[key] !== undefined,
			);

			await this.auditService.createLog({
				performedBy: adminId,
				performerName: adminName,
				action: AuditAction.UPDATED,
				targetType: AuditTargetType.SUBSCRIPTION_PACKAGE,
				targetId: id.toString(),
				details: `Updated subscription package: ${pkg.name}`,
				ipAddress,
				metadata: {
					packageId: id,
					packageName: pkg.name,
					updatedFields: changedFields,
					newValues: updateDto,
				},
			});
		}

		return updated;
	}

	/**
	 * Delete package (soft delete)
	 */
	async deletePackage(
		id: number,
		adminId?: number,
		adminName?: string,
		ipAddress?: string,
	): Promise<void> {
		const pkg = await this.getPackageById(id);

		// Prevent deletion of free package
		if (pkg.packageType === PackageType.FREE) {
			throw new BadRequestException('Cannot delete the free package');
		}

		await this.packageRepository.delete(id);

		// Create audit log
		if (adminId && adminName) {
			await this.auditService.createLog({
				performedBy: adminId,
				performerName: adminName,
				action: AuditAction.DELETED,
				targetType: AuditTargetType.SUBSCRIPTION_PACKAGE,
				targetId: id.toString(),
				details: `Deleted subscription package: ${pkg.name}`,
				ipAddress,
				metadata: {
					packageId: id,
					packageName: pkg.name,
					price: pkg.price,
				},
			});
		}
	}

	/**
	 * Toggle package visibility
	 */
	async toggleVisibility(
		id: number,
		adminId?: number,
		adminName?: string,
		ipAddress?: string,
	): Promise<SubscriptionPackage> {
		const updated = await this.packageRepository.toggleVisibility(id);

		// Create audit log
		if (adminId && adminName) {
			await this.auditService.createLog({
				performedBy: adminId,
				performerName: adminName,
				action: AuditAction.UPDATED,
				targetType: AuditTargetType.SUBSCRIPTION_PACKAGE,
				targetId: id.toString(),
				details: `${updated.isVisible ? 'Showed' : 'Hidden'} subscription package: ${updated.name}`,
				ipAddress,
				metadata: {
					packageId: id,
					action: 'toggle_visibility',
					newStatus: updated.isVisible,
				},
			});
		}

		return updated;
	}

	/**
	 * Toggle package active status
	 */
	async toggleActive(
		id: number,
		adminId?: number,
		adminName?: string,
		ipAddress?: string,
	): Promise<SubscriptionPackage> {
		const updated = await this.packageRepository.toggleActive(id);

		// Create audit log
		if (adminId && adminName) {
			await this.auditService.createLog({
				performedBy: adminId,
				performerName: adminName,
				action: AuditAction.UPDATED,
				targetType: AuditTargetType.SUBSCRIPTION_PACKAGE,
				targetId: id.toString(),
				details: `${updated.isActive ? 'Activated' : 'Deactivated'} subscription package: ${updated.name}`,
				ipAddress,
				metadata: {
					packageId: id,
					action: 'toggle_active',
					newStatus: updated.isActive,
				},
			});
		}

		return updated;
	}

	/**
	 * Toggle featured status
	 */
	async toggleFeatured(
		id: number,
		adminId?: number,
		adminName?: string,
		ipAddress?: string,
	): Promise<SubscriptionPackage> {
		const pkg = await this.getPackageById(id);

		pkg.isFeatured = !pkg.isFeatured;
		const updated = await this.packageRepository.save(pkg);

		// Create audit log
		if (adminId && adminName) {
			await this.auditService.createLog({
				performedBy: adminId,
				performerName: adminName,
				action: AuditAction.UPDATED,
				targetType: AuditTargetType.SUBSCRIPTION_PACKAGE,
				targetId: id.toString(),
				details: `${updated.isFeatured ? 'Featured' : 'Unfeatured'} subscription package: ${updated.name}`,
				ipAddress,
				metadata: {
					packageId: id,
					action: 'toggle_featured',
					newStatus: updated.isFeatured,
				},
			});
		}

		return updated;
	}

	/**
	 * Update display order
	 */
	async updateDisplayOrder(
		id: number,
		order: number,
		adminId?: number,
		adminName?: string,
		ipAddress?: string,
	): Promise<SubscriptionPackage> {
		const updated = await this.packageRepository.updateDisplayOrder(id, order);

		// Create audit log
		if (adminId && adminName) {
			await this.auditService.createLog({
				performedBy: adminId,
				performerName: adminName,
				action: AuditAction.UPDATED,
				targetType: AuditTargetType.SUBSCRIPTION_PACKAGE,
				targetId: id.toString(),
				details: `Updated display order for package to ${order}`,
				ipAddress,
				metadata: {
					packageId: id,
					action: 'update_display_order',
					newOrder: order,
				},
			});
		}

		return updated;
	}

	/**
	 * Get package statistics
	 */
	async getPackageStats(): Promise<{
		total: number;
		active: number;
		visible: number;
		featured: number;
	}> {
		return this.packageRepository.getPackageStats();
	}
}
