'use client';

import { getAiUsageBreakdown, getDailyUsage } from '@/lib/api/billing';
import { AiUsageBreakdown, DailyUsage, formatCredits } from '@/types/billing';
import { useQuery } from '@tanstack/react-query';
import {
	BarChart3,
	Loader2
} from 'lucide-react';

interface UsageAnalyticsProps {
	days?: number;
	className?: string;
}

export default function UsageAnalytics({ days = 30, className = '' }: UsageAnalyticsProps) {
	const { data: aiUsage, isLoading: loadingAiUsage } = useQuery<AiUsageBreakdown>({
		queryKey: ['aiUsageBreakdown'],
		queryFn: () => getAiUsageBreakdown(),
	});

	const { data: dailyUsage, isLoading: loadingDaily } = useQuery<DailyUsage[]>({
		queryKey: ['dailyUsage', days],
		queryFn: () => getDailyUsage(days),
	});

	const isLoading = loadingAiUsage || loadingDaily;

	if (isLoading) {
		return (
			<div className={`flex items-center justify-center p-12 ${className}`}>
				<Loader2 className="h-8 w-8 animate-spin text-amber-500" />
			</div>
		);
	}

	// const usageCategories = [
	// 	{
	// 		name: 'Questions',
	// 		value: aiUsage?.questions || 0,
	// 		icon: Zap,
	// 		color: 'bg-blue-500',
	// 		bgColor: 'bg-blue-100 dark:bg-blue-900/30',
	// 		textColor: 'text-blue-600 dark:text-blue-400',
	// 	},
	// 	{
	// 		name: 'Chat Messages',
	// 		value: aiUsage?.chatMessages || 0,
	// 		icon: MessageSquare,
	// 		color: 'bg-green-500',
	// 		bgColor: 'bg-green-100 dark:bg-green-900/30',
	// 		textColor: 'text-green-600 dark:text-green-400',
	// 	},
	// 	{
	// 		name: 'Document Analysis',
	// 		value: aiUsage?.documentAnalysis || 0,
	// 		icon: FileText,
	// 		color: 'bg-purple-500',
	// 		bgColor: 'bg-purple-100 dark:bg-purple-900/30',
	// 		textColor: 'text-purple-600 dark:text-purple-400',
	// 	},
	// 	{
	// 		name: 'Image Generation',
	// 		value: aiUsage?.imageGeneration || 0,
	// 		icon: Image,
	// 		color: 'bg-pink-500',
	// 		bgColor: 'bg-pink-100 dark:bg-pink-900/30',
	// 		textColor: 'text-pink-600 dark:text-pink-400',
	// 	},
	// 	{
	// 		name: 'Advanced Model',
	// 		value: aiUsage?.advancedModel || 0,
	// 		icon: Sparkles,
	// 		color: 'bg-amber-500',
	// 		bgColor: 'bg-amber-100 dark:bg-amber-900/30',
	// 		textColor: 'text-amber-600 dark:text-amber-400',
	// 	},
	// ];

	// const maxUsage = Math.max(...usageCategories.map((c) => c.value), 1);

	// Calculate chart data
	const maxDailyCredits = Math.max(...(dailyUsage?.map((d) => d.credits) || [1]), 1);

	console.log({ dailyUsage, maxDailyCredits });

	return (
		<div className={`space-y-6 ${className}`}>
			{/* AI Usage Breakdown */}
			{/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				<div className="flex items-center gap-2 mb-6">
					<BarChart3 className="h-5 w-5 text-amber-500" />
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
						AI Usage Breakdown
					</h2>
				</div>

				<div className="space-y-4">
					{usageCategories.map((category) => {
						const Icon = category.icon;
						const percentage =
							maxUsage > 0 ? (category.value / maxUsage) * 100 : 0;

						return (
							<div key={category.name}>
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										<div className={`p-1.5 rounded-lg ${category.bgColor}`}>
											<Icon className={`h-4 w-4 ${category.textColor}`} />
										</div>
										<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
											{category.name}
										</span>
									</div>
									<span className="text-sm font-semibold text-gray-900 dark:text-white">
										{formatCredits(category.value)} credits
									</span>
								</div>
								<div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
									<div
										className={`h-full rounded-full transition-all duration-500 ${category.color}`}
										style={{ width: `${percentage}%` }}
									/>
								</div>
							</div>
						);
					})}
				</div>

				<div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-gray-500 dark:text-gray-400">
							Total AI Credits Used
						</span>
						<span className="text-lg font-bold text-gray-900 dark:text-white">
							{formatCredits(aiUsage?.total || 0)}
						</span>
					</div>
				</div>
			</div> */}

			{/* Daily Usage Chart */}
			<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-2">
						<BarChart3 className="h-5 w-5 text-amber-500" />
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							Daily Usage
						</h2>
					</div>
					<span className="text-sm text-gray-500 dark:text-gray-400">
						Last {days} days
					</span>
				</div>

				{dailyUsage && dailyUsage.length > 0 ? (
					<div className="flex items-end gap-1 h-40">
						{dailyUsage.map((day, index) => {
							const height = maxDailyCredits > 0
								? (day.credits / maxDailyCredits) * 100
								: 0;

							return (
								<div
									key={index}
									className="flex-1 group relative"
									title={`${day.date}: ${formatCredits(day.credits)} credits`}
									style={{
										height: `${Math.max(height, 2)}%`,
									}}

								>
									<div
										className="bg-linear-to-t from-amber-500 to-yellow-400 rounded-t transition-all hover:from-amber-600 hover:to-yellow-500"
										style={{
											height: `${Math.max(height, 2)}%`,
										}}
									/>
									{/* Tooltip */}
									<div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
										<div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
											<div>{day.date}</div>
											<div>{formatCredits(day.credits)} credits</div>
											<div>{day.transactions} transactions</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="h-40 flex items-center justify-center text-gray-500 dark:text-gray-400">
						No usage data available
					</div>
				)}

				{/* Legend */}
				<div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
					<span>{dailyUsage?.[0]?.date}</span>
					<span>{dailyUsage?.[dailyUsage.length - 1]?.date}</span>
				</div>
			</div>
		</div>
	);
}
