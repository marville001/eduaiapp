'use client';

import { getCreditBalance } from '@/lib/api/billing';
import { CreditBalance, formatCredits } from '@/types/billing';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Coins, TrendingDown, TrendingUp } from 'lucide-react';

interface CreditBalanceCardProps {
	compact?: boolean;
	className?: string;
}

export default function CreditBalanceCard({
	compact = false,
	className = '',
}: CreditBalanceCardProps) {
	const { data: balance, isLoading, error } = useQuery<CreditBalance>({
		queryKey: ['creditBalance'],
		queryFn: getCreditBalance,
		refetchInterval: 60000, // Refetch every minute
	});

	if (isLoading) {
		return (
			<div className={`animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl p-4 ${className}`}>
				<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
				<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
			</div>
		);
	}

	if (error || !balance) {
		return (
			<div className={`bg-red-50 dark:bg-red-900/20 rounded-xl p-4 ${className}`}>
				<p className="text-red-600 dark:text-red-400 text-sm">Failed to load credits</p>
			</div>
		);
	}

	const usagePercentage = balance.totalAllocated > 0
		? Math.round((balance.totalConsumed / balance.totalAllocated) * 100)
		: 0;

	if (compact) {
		return (
			<div className={`flex items-center gap-2 ${className}`}>
				<div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-full border border-amber-200 dark:border-amber-800">
					<Coins className="h-4 w-4 text-amber-500" />
					<span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
						{formatCredits(balance.available)}
					</span>
				</div>
				{balance.isLowOnCredits && (
					<AlertTriangle className="h-4 w-4 text-orange-500" />
				)}
			</div>
		);
	}

	return (
		<div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
			{/* Header */}
			<div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-white/20 rounded-lg">
							<Coins className="h-6 w-6 text-white" />
						</div>
						<div>
							<p className="text-white/80 text-sm font-medium">Available Credits</p>
							<p className="text-white text-2xl font-bold">
								{formatCredits(balance.available)}
							</p>
						</div>
					</div>
					{balance.isLowOnCredits && (
						<div className="flex items-center gap-2 bg-red-500/20 px-3 py-1.5 rounded-full">
							<AlertTriangle className="h-4 w-4 text-white" />
							<span className="text-white text-xs font-medium">Low</span>
						</div>
					)}
				</div>
			</div>

			{/* Stats */}
			<div className="p-6">
				<div className="grid grid-cols-2 gap-4 mb-4">
					<div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
						<div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
							<TrendingUp className="h-4 w-4" />
							<span>Total Allocated</span>
						</div>
						<p className="text-lg font-semibold text-gray-900 dark:text-white">
							{formatCredits(balance.totalAllocated)}
						</p>
					</div>
					<div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
						<div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
							<TrendingDown className="h-4 w-4" />
							<span>Total Used</span>
						</div>
						<p className="text-lg font-semibold text-gray-900 dark:text-white">
							{formatCredits(balance.totalConsumed)}
						</p>
					</div>
				</div>

				{/* Usage Progress Bar */}
				<div className="mb-4">
					<div className="flex justify-between text-sm mb-2">
						<span className="text-gray-500 dark:text-gray-400">Usage</span>
						<span className="text-gray-700 dark:text-gray-300 font-medium">
							{usagePercentage}%
						</span>
					</div>
					<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
						<div
							className={`h-full rounded-full transition-all duration-500 ${usagePercentage > 80
								? 'bg-red-500'
								: usagePercentage > 50
									? 'bg-yellow-500'
									: 'bg-green-500'
								}`}
							style={{ width: `${Math.min(usagePercentage, 100)}%` }}
						/>
					</div>
				</div>

				{/* Credit Types */}
				<div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
					<div className="flex items-center gap-2">
						<span>Expiring: {formatCredits(balance.expiring)}</span>
					</div>
					<div className="flex items-center gap-2">
						<span>Purchased: {formatCredits(balance.purchased)}</span>
					</div>
				</div>

				{/* Expiration Warning */}
				{balance.expiresAt && (
					<div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
						<p className="text-orange-600 dark:text-orange-400 text-sm">
							<AlertTriangle className="h-4 w-4 inline mr-1" />
							Credits expire on {new Date(balance.expiresAt).toLocaleDateString()}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
