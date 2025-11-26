import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThanOrEqual, Repository } from 'typeorm';
import { Question } from '../ai/entities/question.entity';
import { Blog, BlogStatus } from '../blogs/entities/blog.entity';
import { SubscriptionStatus, UserSubscription } from '../subscriptions/entities/user-subscription.entity';
import { User } from '../users/entities/user.entity';

export interface AdminStats {
	totalUsers: number;
	usersChange: number;
	usersChangePercent: string;
	usersTrend: 'up' | 'down';

	questionsToday: number;
	questionsChange: number;
	questionsChangePercent: string;
	questionsTrend: 'up' | 'down';

	totalBlogs: number;
	blogsChange: number;
	blogsChangePercent: string;
	blogsTrend: 'up' | 'down';

	totalRevenue: number;
	revenueChange: number;
	revenueChangePercent: string;
	revenueTrend: 'up' | 'down';
	currency: string;
}

export interface RecentQuestion {
	id: string;
	subject: string;
	question: string;
	user: string;
	status: string;
	time: string;
}

export interface RecentUser {
	id: string;
	name: string;
	email: string;
	subscription: string;
	joinDate: string;
	questionsCount: number;
}

export interface AdminDashboardData {
	stats: AdminStats;
	recentQuestions: RecentQuestion[];
	recentUsers: RecentUser[];
}

@Injectable()
export class AdminStatsService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Blog)
		private readonly blogRepository: Repository<Blog>,
		@InjectRepository(Question)
		private readonly questionRepository: Repository<Question>,
		@InjectRepository(UserSubscription)
		private readonly subscriptionRepository: Repository<UserSubscription>,
	) { }

	async getAdminStats(): Promise<AdminStats> {
		const now = new Date();
		const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const startOfYesterday = new Date(startOfToday);
		startOfYesterday.setDate(startOfYesterday.getDate() - 1);

		const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

		// User stats
		const [totalUsers, usersThisMonth, usersLastMonth] = await Promise.all([
			this.userRepository.count(),
			this.userRepository.count({
				where: { createdAt: MoreThanOrEqual(startOfThisMonth) },
			}),
			this.userRepository.count({
				where: { createdAt: Between(startOfLastMonth, endOfLastMonth) },
			}),
		]);

		const usersChange = usersThisMonth - usersLastMonth;
		const usersChangePercent = usersLastMonth > 0
			? ((usersChange / usersLastMonth) * 100).toFixed(1)
			: usersThisMonth > 0 ? '100' : '0';

		// Question stats
		const [questionsToday, questionsYesterday] = await Promise.all([
			this.questionRepository.count({
				where: { createdAt: MoreThanOrEqual(startOfToday) },
			}),
			this.questionRepository.count({
				where: { createdAt: Between(startOfYesterday, startOfToday) },
			}),
		]);

		const questionsChange = questionsToday - questionsYesterday;
		const questionsChangePercent = questionsYesterday > 0
			? ((questionsChange / questionsYesterday) * 100).toFixed(1)
			: questionsToday > 0 ? '100' : '0';

		// Blog stats
		const [totalBlogs, blogsThisMonth, blogsLastMonth] = await Promise.all([
			this.blogRepository.count({
				where: { status: BlogStatus.PUBLISHED },
			}),
			this.blogRepository.count({
				where: {
					status: BlogStatus.PUBLISHED,
					createdAt: MoreThanOrEqual(startOfThisMonth),
				},
			}),
			this.blogRepository.count({
				where: {
					status: BlogStatus.PUBLISHED,
					createdAt: Between(startOfLastMonth, endOfLastMonth),
				},
			}),
		]);

		const blogsChange = blogsThisMonth - blogsLastMonth;
		const blogsChangePercent = blogsLastMonth > 0
			? ((blogsChange / blogsLastMonth) * 100).toFixed(1)
			: blogsThisMonth > 0 ? '100' : '0';

		// Revenue stats (from active subscriptions)
		const [revenueThisMonth, revenueLastMonth] = await Promise.all([
			this.subscriptionRepository
				.createQueryBuilder('subscription')
				.select('COALESCE(SUM(subscription.amount), 0)', 'total')
				.where('subscription.status = :status', { status: SubscriptionStatus.ACTIVE })
				.andWhere('subscription.createdAt >= :startDate', { startDate: startOfThisMonth })
				.getRawOne(),
			this.subscriptionRepository
				.createQueryBuilder('subscription')
				.select('COALESCE(SUM(subscription.amount), 0)', 'total')
				.where('subscription.status = :status', { status: SubscriptionStatus.ACTIVE })
				.andWhere('subscription.createdAt >= :startDate', { startDate: startOfLastMonth })
				.andWhere('subscription.createdAt < :endDate', { endDate: startOfThisMonth })
				.getRawOne(),
		]);

		const totalRevenueThisMonth = parseFloat(revenueThisMonth?.total || '0');
		const totalRevenueLastMonth = parseFloat(revenueLastMonth?.total || '0');
		const revenueChange = totalRevenueThisMonth - totalRevenueLastMonth;
		const revenueChangePercent = totalRevenueLastMonth > 0
			? ((revenueChange / totalRevenueLastMonth) * 100).toFixed(1)
			: totalRevenueThisMonth > 0 ? '100' : '0';

		return {
			totalUsers,
			usersChange,
			usersChangePercent: `${usersChange >= 0 ? '+' : ''}${usersChangePercent}%`,
			usersTrend: usersChange >= 0 ? 'up' : 'down',

			questionsToday,
			questionsChange,
			questionsChangePercent: `${questionsChange >= 0 ? '+' : ''}${questionsChangePercent}%`,
			questionsTrend: questionsChange >= 0 ? 'up' : 'down',

			totalBlogs,
			blogsChange,
			blogsChangePercent: `${blogsChange >= 0 ? '+' : ''}${blogsChangePercent}%`,
			blogsTrend: blogsChange >= 0 ? 'up' : 'down',

			totalRevenue: totalRevenueThisMonth,
			revenueChange,
			revenueChangePercent: `${revenueChange >= 0 ? '+' : ''}${revenueChangePercent}%`,
			revenueTrend: revenueChange >= 0 ? 'up' : 'down',
			currency: 'USD',
		};
	}

	async getRecentQuestions(limit: number = 5): Promise<RecentQuestion[]> {
		const questions = await this.questionRepository.find({
			relations: ['user', 'subject'],
			order: { createdAt: 'DESC' },
			take: limit,
		});

		return questions.map((q) => ({
			id: q.questionId,
			subject: q.subject?.name || 'General',
			question: q.question,
			user: q.user?.fullName || 'Anonymous',
			status: q.status,
			time: this.getRelativeTime(q.createdAt),
		}));
	}

	async getRecentUsers(limit: number = 5): Promise<RecentUser[]> {
		const users = await this.userRepository.find({
			order: { createdAt: 'DESC' },
			take: limit,
			where: { isAdminUser: false },
		});

		if (users.length === 0) {
			return [];
		}

		// Get user IDs
		const userIds = users.map(u => u.id);

		// Get question counts for each user
		const questionCounts = await this.questionRepository
			.createQueryBuilder('question')
			.select('question.userId', 'userId')
			.addSelect('COUNT(question.id)', 'count')
			.where('question.userId IN (:...userIds)', { userIds })
			.groupBy('question.userId')
			.getRawMany();

		const countMap = new Map(questionCounts.map(qc => [qc.userId, parseInt(qc.count)]));

		// Get all active subscriptions for these users
		const activeSubscriptions = await this.subscriptionRepository
			.createQueryBuilder('subscription')
			.leftJoinAndSelect('subscription.package', 'package')
			.where('subscription.userId IN (:...userIds)', { userIds })
			.andWhere('subscription.status = :status', { status: SubscriptionStatus.ACTIVE })
			.getMany();

		const subscriptionMap = new Map(activeSubscriptions.map(sub => [sub.userId, sub]));

		return users.map((user) => {
			const activeSubscription = subscriptionMap.get(user.id);

			return {
				id: user.userId,
				name: user.fullName,
				email: user.email,
				subscription: activeSubscription?.package?.name || 'Free',
				joinDate: user.createdAt.toISOString().split('T')[0],
				questionsCount: countMap.get(user.id) || 0,
			};
		});
	}

	async getDashboardData(): Promise<AdminDashboardData> {
		const [stats, recentQuestions, recentUsers] = await Promise.all([
			this.getAdminStats(),
			this.getRecentQuestions(),
			this.getRecentUsers(),
		]);

		return {
			stats,
			recentQuestions,
			recentUsers,
		};
	}

	private getRelativeTime(date: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
		if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
		if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

		return date.toLocaleDateString();
	}
}
