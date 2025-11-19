import { AbstractRepository } from '@/database/abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackageType, SubscriptionPackage } from './entities/subscription-package.entity';

@Injectable()
export class SubscriptionPackageRepository extends AbstractRepository<SubscriptionPackage> {
	constructor(
		@InjectRepository(SubscriptionPackage)
		private readonly packageRepository: Repository<SubscriptionPackage>,
	) {
		super(packageRepository);
	}

	/**
	 * Get all active packages
	 */
	async getActivePackages(): Promise<SubscriptionPackage[]> {
		return this.findAll({
			where: { isActive: true },
			order: { displayOrder: 'ASC', price: 'ASC' },
		});
	}

	/**
	 * Get all visible packages (for public display)
	 */
	async getVisiblePackages(): Promise<SubscriptionPackage[]> {
		return this.findAll({
			where: { isActive: true, isVisible: true },
			order: { displayOrder: 'ASC', price: 'ASC' },
		});
	}

	/**
	 * Get featured packages
	 */
	async getFeaturedPackages(): Promise<SubscriptionPackage[]> {
		return this.findAll({
			where: { isActive: true, isVisible: true, isFeatured: true },
			order: { displayOrder: 'ASC' },
		});
	}

	/**
	 * Get package by Stripe Price ID
	 */
	async findByStripePriceId(stripePriceId: string): Promise<SubscriptionPackage | null> {
		return this.findOne({ where: { stripePriceId } });
	}

	/**
	 * Get package by Stripe Product ID
	 */
	async findByStripeProductId(stripeProductId: string): Promise<SubscriptionPackage[]> {
		return this.findAll({ where: { stripeProductId } });
	}

	/**
	 * Get package by type
	 */
	async findByType(packageType: PackageType): Promise<SubscriptionPackage[]> {
		return this.findAll({
			where: { packageType, isActive: true },
			order: { price: 'ASC' },
		});
	}

	/**
	 * Get free package
	 */
	async getFreePackage(): Promise<SubscriptionPackage | null> {
		return this.findOne({
			where: { packageType: PackageType.FREE, isActive: true },
		});
	}

	/**
	 * Toggle package visibility
	 */
	async toggleVisibility(id: number): Promise<SubscriptionPackage> {
		const pkg = await this.findById(id);
		if (!pkg) {
			throw new Error('Package not found');
		}

		pkg.isVisible = !pkg.isVisible;
		return this.save(pkg);
	}

	/**
	 * Toggle package active status
	 */
	async toggleActive(id: number): Promise<SubscriptionPackage> {
		const pkg = await this.findById(id);
		if (!pkg) {
			throw new Error('Package not found');
		}

		pkg.isActive = !pkg.isActive;
		return this.save(pkg);
	}

	/**
	 * Update display order
	 */
	async updateDisplayOrder(id: number, order: number): Promise<SubscriptionPackage> {
		return this.update({ id } as any, { displayOrder: order });
	}

	/**
	 * Get packages count by status
	 */
	async getPackageStats(): Promise<{
		total: number;
		active: number;
		visible: number;
		featured: number;
	}> {
		const [allPackages] = await this.findAndCount();
		const [activePackages] = await this.findAndCount({ where: { isActive: true } });
		const [visiblePackages] = await this.findAndCount({
			where: { isActive: true, isVisible: true },
		});
		const [featuredPackages] = await this.findAndCount({
			where: { isActive: true, isVisible: true, isFeatured: true },
		});

		return {
			total: allPackages.length,
			active: activePackages.length,
			visible: visiblePackages.length,
			featured: featuredPackages.length,
		};
	}
}
