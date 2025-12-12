import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CreditTransaction, CreditTransactionStatus, CreditTransactionType } from './entities/credit-transaction.entity';

export interface CreateTransactionDto {
	userId: number;
	transactionType: CreditTransactionType;
	amount: number;
	balanceBefore: number;
	balanceAfter: number;
	description: string;
	referenceId?: string;
	referenceType?: string;
	ipAddress?: string;
	userAgent?: string;
	metadata?: Record<string, any>;
	expiresAt?: Date;
	status?: CreditTransactionStatus;
}

export interface TransactionFilters {
	userId?: number;
	transactionType?: CreditTransactionType;
	startDate?: Date;
	endDate?: Date;
	status?: CreditTransactionStatus;
}

@Injectable()
export class CreditTransactionRepository {
	private readonly logger = new Logger(CreditTransactionRepository.name);

	constructor(
		@InjectRepository(CreditTransaction)
		private readonly repository: Repository<CreditTransaction>,
	) { }

	async create(data: CreateTransactionDto): Promise<CreditTransaction> {
		const transaction = this.repository.create({
			...data,
			status: data.status || CreditTransactionStatus.COMPLETED,
		});
		return this.repository.save(transaction);
	}

	async findById(id: number): Promise<CreditTransaction | null> {
		return this.repository.findOne({ where: { id } });
	}

	async findByUserId(
		userId: number,
		options?: {
			limit?: number;
			offset?: number;
			transactionType?: CreditTransactionType;
		},
	): Promise<{ transactions: CreditTransaction[]; total: number; }> {
		const queryBuilder = this.repository
			.createQueryBuilder('ct')
			.where('ct.user_id = :userId', { userId })
			.orderBy('ct.created_at', 'DESC');

		if (options?.transactionType) {
			queryBuilder.andWhere('ct.transaction_type = :type', { type: options.transactionType });
		}

		const total = await queryBuilder.getCount();

		if (options?.limit) {
			queryBuilder.take(options.limit);
		}
		if (options?.offset) {
			queryBuilder.skip(options.offset);
		}

		const transactions = await queryBuilder.getMany();

		return { transactions, total };
	}

	async findByReferenceId(referenceId: string): Promise<CreditTransaction[]> {
		return this.repository.find({
			where: { referenceId },
			order: { createdAt: 'DESC' },
		});
	}

	/**
	 * Get transaction summary for a user within a date range
	 */
	async getUserSummary(
		userId: number,
		startDate: Date,
		endDate: Date,
	): Promise<{
		totalCredits: number;
		totalDebits: number;
		netChange: number;
		transactionCount: number;
		byType: Record<CreditTransactionType, number>;
	}> {
		const transactions = await this.repository.find({
			where: {
				userId,
				createdAt: Between(startDate, endDate),
				status: CreditTransactionStatus.COMPLETED,
			},
		});

		const summary = {
			totalCredits: 0,
			totalDebits: 0,
			netChange: 0,
			transactionCount: transactions.length,
			byType: {} as Record<CreditTransactionType, number>,
		};

		for (const tx of transactions) {
			const amount = Number(tx.amount);
			if (amount > 0) {
				summary.totalCredits += amount;
			} else {
				summary.totalDebits += Math.abs(amount);
			}
			summary.netChange += amount;

			summary.byType[tx.transactionType] = (summary.byType[tx.transactionType] || 0) + Math.abs(amount);
		}

		return summary;
	}

	/**
	 * Get AI usage breakdown for a user
	 */
	async getAiUsageBreakdown(
		userId: number,
		startDate?: Date,
		endDate?: Date,
	): Promise<{
		questions: number;
		chatMessages: number;
		documentAnalysis: number;
		imageGeneration: number;
		advancedModel: number;
		total: number;
	}> {
		const queryBuilder = this.repository
			.createQueryBuilder('ct')
			.select('ct.transaction_type', 'type')
			.addSelect('SUM(ABS(ct.amount))', 'total')
			.where('ct.user_id = :userId', { userId })
			.andWhere('ct.transaction_type IN (:...types)', {
				types: [
					CreditTransactionType.AI_QUESTION,
					CreditTransactionType.AI_CHAT_MESSAGE,
					CreditTransactionType.AI_DOCUMENT_ANALYSIS,
					CreditTransactionType.AI_IMAGE_GENERATION,
					CreditTransactionType.AI_ADVANCED_MODEL,
				],
			})
			.andWhere('ct.status = :status', { status: CreditTransactionStatus.COMPLETED })
			.groupBy('ct.transaction_type');

		if (startDate && endDate) {
			queryBuilder.andWhere('ct.created_at BETWEEN :startDate AND :endDate', { startDate, endDate });
		}

		const results = await queryBuilder.getRawMany();

		const breakdown = {
			questions: 0,
			chatMessages: 0,
			documentAnalysis: 0,
			imageGeneration: 0,
			advancedModel: 0,
			total: 0,
		};

		for (const row of results) {
			const amount = parseFloat(row.total || '0');
			switch (row.type) {
				case CreditTransactionType.AI_QUESTION:
					breakdown.questions = amount;
					break;
				case CreditTransactionType.AI_CHAT_MESSAGE:
					breakdown.chatMessages = amount;
					break;
				case CreditTransactionType.AI_DOCUMENT_ANALYSIS:
					breakdown.documentAnalysis = amount;
					break;
				case CreditTransactionType.AI_IMAGE_GENERATION:
					breakdown.imageGeneration = amount;
					break;
				case CreditTransactionType.AI_ADVANCED_MODEL:
					breakdown.advancedModel = amount;
					break;
			}
			breakdown.total += amount;
		}

		return breakdown;
	}

	/**
	 * Reverse a transaction (for refunds)
	 */
	async reverseTransaction(
		originalTransactionId: number,
		description: string,
	): Promise<CreditTransaction | null> {
		const original = await this.findById(originalTransactionId);
		if (!original || original.status === CreditTransactionStatus.REVERSED) {
			return null;
		}

		// Mark original as reversed
		original.status = CreditTransactionStatus.REVERSED;
		await this.repository.save(original);

		// Create reversal transaction
		const reversal = this.repository.create({
			userId: original.userId,
			transactionType: CreditTransactionType.REFUND,
			amount: -original.amount, // Opposite of original
			balanceBefore: original.balanceAfter,
			balanceAfter: original.balanceBefore,
			description,
			referenceId: original.referenceId,
			referenceType: original.referenceType,
			originalTransactionId: original.id,
			status: CreditTransactionStatus.COMPLETED,
		});

		return this.repository.save(reversal);
	}

	/**
	 * Get daily/hourly usage for analytics
	 */
	async getDailyUsage(
		userId: number,
		days: number = 30,
	): Promise<Array<{ date: string; credits: number; transactions: number; }>> {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const results = await this.repository
			.createQueryBuilder('ct')
			.select('DATE(ct.created_at)', 'date')
			.addSelect('SUM(ABS(ct.amount))', 'credits')
			.addSelect('COUNT(*)', 'transactions')
			.where('ct.user_id = :userId', { userId })
			.andWhere('ct.amount < 0') // Only debits
			.andWhere('ct.created_at >= :startDate', { startDate })
			.andWhere('ct.status = :status', { status: CreditTransactionStatus.COMPLETED })
			.groupBy('DATE(ct.created_at)')
			.orderBy('date', 'ASC')
			.getRawMany();

		return results.map(r => ({
			date: r.date,
			credits: parseFloat(r.credits || '0'),
			transactions: parseInt(r.transactions || '0'),
		}));
	}

	/**
	 * Get global statistics for admin
	 */
	async getGlobalStatistics(startDate?: Date, endDate?: Date): Promise<{
		totalTransactions: number;
		totalCreditsAllocated: number;
		totalCreditsConsumed: number;
		topTransactionTypes: Array<{ type: CreditTransactionType; count: number; amount: number; }>;
	}> {
		const queryBuilder = this.repository
			.createQueryBuilder('ct')
			.where('ct.status = :status', { status: CreditTransactionStatus.COMPLETED });

		if (startDate && endDate) {
			queryBuilder.andWhere('ct.created_at BETWEEN :startDate AND :endDate', { startDate, endDate });
		}

		const transactions = await queryBuilder.getMany();

		let totalAllocated = 0;
		let totalConsumed = 0;
		const typeStats: Record<CreditTransactionType, { count: number; amount: number; }> = {} as any;

		for (const tx of transactions) {
			const amount = Number(tx.amount);
			if (amount > 0) {
				totalAllocated += amount;
			} else {
				totalConsumed += Math.abs(amount);
			}

			if (!typeStats[tx.transactionType]) {
				typeStats[tx.transactionType] = { count: 0, amount: 0 };
			}
			typeStats[tx.transactionType].count++;
			typeStats[tx.transactionType].amount += Math.abs(amount);
		}

		const topTransactionTypes = Object.entries(typeStats)
			.map(([type, stats]) => ({
				type: type as CreditTransactionType,
				count: stats.count,
				amount: stats.amount,
			}))
			.sort((a, b) => b.amount - a.amount);

		return {
			totalTransactions: transactions.length,
			totalCreditsAllocated: totalAllocated,
			totalCreditsConsumed: totalConsumed,
			topTransactionTypes,
		};
	}
}
