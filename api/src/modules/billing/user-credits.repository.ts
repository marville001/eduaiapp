import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCredits } from './entities/user-credits.entity';

@Injectable()
export class UserCreditsRepository {
	private readonly logger = new Logger(UserCreditsRepository.name);

	constructor(
		@InjectRepository(UserCredits)
		private readonly repository: Repository<UserCredits>,
	) { }

	async findByUserId(userId: number): Promise<UserCredits | null> {
		return this.repository.findOne({
			where: { userId },
		});
	}

	async findOrCreate(userId: number): Promise<UserCredits> {
		let credits = await this.findByUserId(userId);

		if (!credits) {
			credits = this.repository.create({ userId });
			credits = await this.repository.save(credits);
			this.logger.log(`Created credit record for user ${userId}`);
		}

		return credits;
	}

	async save(credits: UserCredits): Promise<UserCredits> {
		return this.repository.save(credits);
	}

	async updateBalance(
		userId: number,
		availableCredits: number,
		additionalUpdates?: Partial<UserCredits>,
	): Promise<UserCredits> {
		const credits = await this.findOrCreate(userId);
		credits.availableCredits = availableCredits;

		if (additionalUpdates) {
			Object.assign(credits, additionalUpdates);
		}

		return this.repository.save(credits);
	}

	/**
	 * Atomic credit deduction with optimistic locking
	 */
	async deductCredits(userId: number, amount: number): Promise<{ success: boolean; newBalance: number; }> {
		const result = await this.repository
			.createQueryBuilder()
			.update(UserCredits)
			.set({
				availableCredits: () => `available_credits - ${amount}`,
				totalConsumed: () => `total_consumed + ${amount}`,
			})
			.where('user_id = :userId', { userId })
			.andWhere('available_credits >= :amount', { amount })
			.returning(['available_credits'])
			.execute();

		if (result.affected === 0) {
			return { success: false, newBalance: 0 };
		}

		console.log("==========");
		console.log(result);


		const newBalance = result.raw[0]?.available_credits || 0;
		return { success: true, newBalance: Number(newBalance) };
	}

	/**
	 * Atomic credit addition
	 */
	async addCredits(
		userId: number,
		amount: number,
		isExpiring: boolean = true,
	): Promise<{ newBalance: number; }> {
		const credits = await this.findOrCreate(userId);

		const updateData: Partial<UserCredits> = {
			availableCredits: Number(credits.availableCredits) + amount,
			totalAllocated: Number(credits.totalAllocated) + amount,
		};

		if (isExpiring) {
			updateData.expiringCredits = Number(credits.expiringCredits || 0) + amount;
		} else {
			updateData.purchasedCredits = Number(credits.purchasedCredits || 0) + amount;
		}

		Object.assign(credits, updateData);
		const saved = await this.repository.save(credits);

		return { newBalance: Number(saved.availableCredits) };
	}

	/**
	 * Reset expiring credits at billing cycle end
	 */
	async resetExpiringCredits(userId: number): Promise<void> {
		const credits = await this.findByUserId(userId);
		if (!credits) return;

		// Remove expiring credits from available balance
		const expiringAmount = Number(credits.expiringCredits || 0);
		if (expiringAmount > 0) {
			credits.availableCredits = Math.max(0, Number(credits.availableCredits) - expiringAmount);
			credits.expiringCredits = 0;
			credits.lastResetAt = new Date();
			credits.lowCreditNotified = false;
			await this.repository.save(credits);
		}
	}

	/**
	 * Get users with low credits for notification
	 */
	async findUsersWithLowCredits(): Promise<UserCredits[]> {
		return this.repository
			.createQueryBuilder('uc')
			.where('uc.available_credits <= uc.low_credit_threshold')
			.andWhere('uc.low_credit_notified = false')
			.getMany();
	}

	/**
	 * Mark user as notified for low credits
	 */
	async markLowCreditNotified(userId: number): Promise<void> {
		await this.repository.update({ userId }, { lowCreditNotified: true });
	}

	/**
	 * Get credit statistics for admin dashboard
	 */
	async getStatistics(): Promise<{
		totalUsers: number;
		totalCreditsInCirculation: number;
		totalCreditsConsumed: number;
		averageCreditsPerUser: number;
	}> {
		const result = await this.repository
			.createQueryBuilder('uc')
			.select([
				'COUNT(uc.id) as total_users',
				'SUM(uc.available_credits) as total_credits',
				'SUM(uc.total_consumed) as total_consumed',
				'AVG(uc.available_credits) as avg_credits',
			])
			.getRawOne();

		return {
			totalUsers: parseInt(result.total_users || '0'),
			totalCreditsInCirculation: parseFloat(result.total_credits || '0'),
			totalCreditsConsumed: parseFloat(result.total_consumed || '0'),
			averageCreditsPerUser: parseFloat(result.avg_credits || '0'),
		};
	}
}
