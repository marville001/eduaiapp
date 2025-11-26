'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface UsageLimitIndicatorProps {
	action: 'question' | 'chat' | 'upload';
	showAlways?: boolean;
}

export function UsageLimitIndicator({ action, showAlways = false }: UsageLimitIndicatorProps) {
	const { data: usage } = useQuery({
		queryKey: ['usage-statistics'],
		queryFn: subscriptionsApi.getUsageStatistics,
	});

	const { data: canPerform } = useQuery({
		queryKey: ['can-perform', action],
		queryFn: () => subscriptionsApi.canPerformAction(action),
	});

	if (!usage) return null;

	const getUsageData = () => {
		switch (action) {
			case 'question':
				return {
					used: usage.questionsUsed,
					limit: usage.questionsLimit,
					remaining: usage.questionsRemaining,
					label: 'Questions',
				};
			case 'chat':
				return {
					used: usage.chatsUsed,
					limit: usage.chatsLimit,
					remaining: usage.chatsRemaining,
					label: 'AI Chats',
				};
			case 'upload':
				return {
					used: usage.fileUploadsUsed,
					limit: usage.fileUploadsLimit,
					remaining: usage.fileUploadsRemaining,
					label: 'File Uploads',
				};
		}
	};

	const usageData = getUsageData();
	const percentage = usageData.limit === -1 || usageData.remaining === 'Unlimited'
		? 0
		: (usageData.used / usageData.limit) * 100;

	// Only show if limit is reached or showAlways is true
	const shouldShow = showAlways || (canPerform && !canPerform.canPerform) || percentage >= 80;

	if (!shouldShow) return null;

	// Limit reached
	if (canPerform && !canPerform.canPerform) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Limit Reached</AlertTitle>
				<AlertDescription className="space-y-2">
					<p>
						You've used all {usageData.limit} {usageData.label.toLowerCase()} for this billing period.
					</p>
					<Link href="/pricing">
						<Button variant="outline" size="sm" className="mt-2">
							<TrendingUp className="h-4 w-4 mr-2" />
							Upgrade Plan
						</Button>
					</Link>
				</AlertDescription>
			</Alert>
		);
	}

	// Warning (80% or more used)
	if (percentage >= 80) {
		return (
			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Usage Warning</AlertTitle>
				<AlertDescription className="space-y-2">
					<p>
						You've used {usageData.used} of {usageData.limit} {usageData.label.toLowerCase()}.
					</p>
					<Progress value={percentage} className="h-2" />
					<p className="text-sm text-muted-foreground mt-1">
						{usageData.remaining} remaining
					</p>
					<Link href="/pricing">
						<Button variant="outline" size="sm" className="mt-2">
							View Plans
						</Button>
					</Link>
				</AlertDescription>
			</Alert>
		);
	}

	return null;
}
