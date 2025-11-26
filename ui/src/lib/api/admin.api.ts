import apiClient from '.';

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

export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
	const response = await apiClient.get<{ data: AdminDashboardData; }>('/admin/stats');
	return response.data.data;
};

export const getAdminStatsOverview = async (): Promise<AdminStats> => {
	const response = await apiClient.get<{ data: AdminStats; }>('/admin/stats/overview');
	return response.data.data;
};

export const getRecentQuestions = async (): Promise<RecentQuestion[]> => {
	const response = await apiClient.get<{ data: RecentQuestion[]; }>('/admin/stats/recent-questions');
	return response.data.data;
};

export const getRecentUsers = async (): Promise<RecentUser[]> => {
	const response = await apiClient.get<{ data: RecentUser[]; }>('/admin/stats/recent-users');
	return response.data.data;
};

const adminApi = {
	getAdminDashboardData,
	getAdminStatsOverview,
	getRecentQuestions,
	getRecentUsers,
};

export default adminApi;
