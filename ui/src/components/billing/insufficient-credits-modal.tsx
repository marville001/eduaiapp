'use client';

import { CreditBalance, formatCredits } from '@/types/billing';
import { AlertTriangle, CreditCard, X } from 'lucide-react';
import Link from 'next/link';

interface InsufficientCreditsModalProps {
	isOpen: boolean;
	onClose: () => void;
	required: number;
	available: number;
	balance?: CreditBalance;
}

export default function InsufficientCreditsModal({
	isOpen,
	onClose,
	required,
	available,
	balance,
}: InsufficientCreditsModalProps) {
	if (!isOpen) return null;

	const shortfall = required - available;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
				{/* Close button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
				>
					<X className="h-5 w-5 text-gray-500" />
				</button>

				{/* Header with gradient */}
				<div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-8 text-center">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
						<AlertTriangle className="h-8 w-8 text-white" />
					</div>
					<h2 className="text-xl font-bold text-white mb-2">
						Insufficient Credits
					</h2>
					<p className="text-white/80 text-sm">
						You need more credits to perform this action
					</p>
				</div>

				{/* Content */}
				<div className="p-6">
					{/* Credit Stats */}
					<div className="grid grid-cols-2 gap-4 mb-6">
						<div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
							<p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
								Required
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{formatCredits(required)}
							</p>
						</div>
						<div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
							<p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
								Available
							</p>
							<p className="text-2xl font-bold text-red-600 dark:text-red-400">
								{formatCredits(available)}
							</p>
						</div>
					</div>

					{/* Shortfall */}
					<div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
						<div className="flex items-center justify-between">
							<span className="text-sm text-red-600 dark:text-red-400">
								Credits needed
							</span>
							<span className="text-lg font-semibold text-red-600 dark:text-red-400">
								+{formatCredits(shortfall)}
							</span>
						</div>
					</div>

					{/* Actions */}
					<div className="space-y-3">
						<Link
							href="/pricing"
							className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-all"
							onClick={onClose}
						>
							Upgrade Plan
						</Link>

						<Link
							href="/billing"
							className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
							onClick={onClose}
						>
							<CreditCard className="h-5 w-5" />
							View Billing Details
						</Link>
					</div>

					{/* Balance info */}
					{balance && (
						<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-500 dark:text-gray-400">
									Total used this period
								</span>
								<span className="text-gray-900 dark:text-white font-medium">
									{formatCredits(balance.totalConsumed)}
								</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
