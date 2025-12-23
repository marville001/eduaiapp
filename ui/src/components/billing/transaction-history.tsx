'use client';

import { getTransactionHistory } from '@/lib/api/billing';
import {
	CreditTransaction,
	CreditTransactionType,
	formatCredits,
	formatTokenUsage,
	getTransactionTypeLabel,
	hasTokenUsage,
	isCredit,
} from '@/types/billing';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
	ArrowDownCircle,
	ArrowUpCircle,
	ChevronLeft,
	ChevronRight,
	Cpu,
	Filter,
	Loader2,
} from 'lucide-react';
import { useState } from 'react';

interface TransactionHistoryProps {
	limit?: number;
	showPagination?: boolean;
	showFilters?: boolean;
	className?: string;
}

const TRANSACTION_ICONS: Record<string, React.ElementType> = {
	default_credit: ArrowUpCircle,
	default_debit: ArrowDownCircle,
};

export default function TransactionHistory({
	limit = 10,
	showPagination = true,
	showFilters = true,
	className = '',
}: TransactionHistoryProps) {
	const [offset, setOffset] = useState(0);
	const [selectedType, setSelectedType] = useState<CreditTransactionType | ''>('');

	const { data, isLoading, error } = useQuery({
		queryKey: ['transactions', limit, offset, selectedType],
		queryFn: () =>
			getTransactionHistory({
				limit,
				offset,
				transactionType: selectedType || undefined,
			}),
	});

	const transactions = data?.transactions || [];
	const total = data?.total || 0;
	const totalPages = Math.ceil(total / limit);
	const currentPage = Math.floor(offset / limit) + 1;

	const handlePrevPage = () => {
		setOffset(Math.max(0, offset - limit));
	};

	const handleNextPage = () => {
		if (offset + limit < total) {
			setOffset(offset + limit);
		}
	};

	const getTransactionIcon = (transaction: CreditTransaction) => {
		const isPositive = isCredit(transaction);
		const Icon = isPositive
			? TRANSACTION_ICONS.default_credit
			: TRANSACTION_ICONS.default_debit;
		return Icon;
	};

	const transactionTypeOptions = [
		{ value: '', label: 'All Types' },
		{ value: CreditTransactionType.AI_QUESTION, label: 'AI Questions' },
		{ value: CreditTransactionType.AI_CHAT_MESSAGE, label: 'AI Chat' },
		{ value: CreditTransactionType.SUBSCRIPTION_ALLOCATION, label: 'Subscription' },
		{ value: CreditTransactionType.SIGNUP_BONUS, label: 'Bonuses' },
		{ value: CreditTransactionType.ADMIN_ADJUSTMENT, label: 'Adjustments' },
		{ value: CreditTransactionType.EXPIRATION, label: 'Expired' },
	];

	if (error) {
		return (
			<div className={`bg-red-50 dark:bg-red-900/20 rounded-xl p-6 ${className}`}>
				<p className="text-red-600 dark:text-red-400">Failed to load transaction history</p>
			</div>
		);
	}

	return (
		<div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
			{/* Header */}
			<div className="p-6 border-b border-gray-200 dark:border-gray-700">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
						Transaction History
					</h2>
					{showFilters && (
						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4 text-gray-400" />
							<select
								value={selectedType}
								onChange={(e) => {
									setSelectedType(e.target.value as CreditTransactionType | '');
									setOffset(0);
								}}
								className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
							>
								{transactionTypeOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="divide-y divide-gray-100 dark:divide-gray-700">
				{isLoading ? (
					<div className="p-8 flex items-center justify-center">
						<Loader2 className="h-6 w-6 animate-spin text-gray-400" />
					</div>
				) : transactions.length === 0 ? (
					<div className="p-8 text-center text-gray-500 dark:text-gray-400">
						No transactions found
					</div>
				) : (
					transactions.map((transaction) => {
						const Icon = getTransactionIcon(transaction);
						const positive = isCredit(transaction);

						return (
							<div
								key={transaction.id}
								className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
							>
								<div className="flex items-center gap-4">
									<div
										className={`p-2 rounded-full ${positive
											? 'bg-green-100 dark:bg-green-900/30'
											: 'bg-red-100 dark:bg-red-900/30'
											}`}
									>
										<Icon
											className={`h-5 w-5 ${positive
												? 'text-green-600 dark:text-green-400'
												: 'text-red-600 dark:text-red-400'
												}`}
										/>
									</div>

									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-gray-900 dark:text-white truncate">
											{getTransactionTypeLabel(transaction.transactionType)}
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
											{transaction.description}
										</p>
									</div>

									<div className="text-right">
										<p
											className={`text-sm font-semibold ${positive
												? 'text-green-600 dark:text-green-400'
												: 'text-red-600 dark:text-red-400'
												}`}
										>
											{positive ? '+' : '-'}{formatCredits(transaction.amount)}
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											{format(new Date(transaction.createdAt), 'MMM d, HH:mm')}
										</p>
									</div>
								</div>

								{/* Balance after and Token usage */}
								<div className="mt-2 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
									<span>Balance: {formatCredits(transaction.balanceAfter)} credits</span>
									{hasTokenUsage(transaction) && (
										<span className="flex items-center gap-1">
											<Cpu className="h-3 w-3" />
											{formatTokenUsage(transaction)}
											{transaction.aiModel && (
												<span className="ml-1 text-gray-500">({transaction.aiModel})</span>
											)}
										</span>
									)}
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Pagination */}
			{showPagination && total > limit && (
				<div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Showing {offset + 1}-{Math.min(offset + limit, total)} of {total}
					</p>
					<div className="flex items-center gap-2">
						<button
							onClick={handlePrevPage}
							disabled={offset === 0}
							className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
						>
							<ChevronLeft className="h-4 w-4" />
						</button>
						<span className="text-sm text-gray-600 dark:text-gray-400">
							Page {currentPage} of {totalPages}
						</span>
						<button
							onClick={handleNextPage}
							disabled={offset + limit >= total}
							className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
						>
							<ChevronRight className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
