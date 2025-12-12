'use client';

import {
	CreditBalanceCard,
	TransactionHistory,
	UsageAnalytics,
} from '@/components/billing';
import { CreditCard, History, TrendingUp } from 'lucide-react';
import { useState } from 'react';

type TabType = 'overview' | 'history' | 'analytics';

export default function BillingPage() {
	const [activeTab, setActiveTab] = useState<TabType>('overview');

	const tabs = [
		{ id: 'overview' as const, label: 'Overview', icon: CreditCard },
		{ id: 'history' as const, label: 'History', icon: History },
		{ id: 'analytics' as const, label: 'Analytics', icon: TrendingUp },
	];

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Header */}
			<div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex items-center gap-4 mb-6">
						<div>
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
								Billing & Credits
							</h1>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Manage your credits and view usage history
							</p>
						</div>
					</div>

					{/* Tabs */}
					<div className="flex gap-2">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							return (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === tab.id
										? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
										: 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
										}`}
								>
									<Icon className="h-4 w-4" />
									{tab.label}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{activeTab === 'overview' && (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Credit Balance */}
						<div className="lg:col-span-1">
							<CreditBalanceCard />
						</div>

						{/* Quick Stats & Recent Transactions */}
						<div className="lg:col-span-2 space-y-6">
							<UsageAnalytics days={7} />
							<TransactionHistory limit={5} showPagination={false} showFilters={false} />
						</div>
					</div>
				)}

				{activeTab === 'history' && (
					<TransactionHistory limit={20} showPagination={true} showFilters={true} />
				)}

				{activeTab === 'analytics' && <UsageAnalytics days={30} />}
			</div>
		</div>
	);
}
