'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import { useQuery } from '@tanstack/react-query';
import { FileUp, HelpCircle, MessageSquare, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export function UsageWidget() {
	const { data: usage, isLoading } = useQuery({
		queryKey: ['usage-statistics'],
		queryFn: subscriptionsApi.getUsageStatistics,
	});

	if (isLoading || !usage || !usage.hasSubscription) {
		return null;
	}

	const calculatePercentage = (used: number, limit: number | string) => {
		if (limit === 'Unlimited' || limit === -1) return 0;
		const numLimit = typeof limit === 'string' ? parseInt(limit) : limit;
		return Math.min((used / numLimit) * 100, 100);
	};

	const formatLimit = (limit: number | string) => {
		if (limit === 'Unlimited' || limit === -1) return '∞';
		return limit.toString();
	};

	return (
		<Card>
			<CardContent className="pt-6">
				<div className="space-y-4">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-sm font-semibold">Usage This Month</h3>
						<Link href="/app/subscription">
							<Button variant="ghost" size="sm">
								View Details
							</Button>
						</Link>
					</div>

					{/* Questions */}
					<div>
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<HelpCircle className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm">Questions</span>
							</div>
							<span className="text-sm text-muted-foreground">
								{usage.questionsUsed} / {formatLimit(usage.questionsLimit)}
							</span>
						</div>
						<Progress value={calculatePercentage(usage.questionsUsed, usage.questionsLimit)} className="h-2" />
					</div>

					{/* Chats */}
					<div>
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<MessageSquare className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm">AI Chats</span>
							</div>
							<span className="text-sm text-muted-foreground">
								{usage.chatsUsed} / {formatLimit(usage.chatsLimit)}
							</span>
						</div>
						<Progress value={calculatePercentage(usage.chatsUsed, usage.chatsLimit)} className="h-2" />
					</div>

					{/* File Uploads */}
					<div>
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<FileUp className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm">File Uploads</span>
							</div>
							<span className="text-sm text-muted-foreground">
								{usage.fileUploadsUsed} / {formatLimit(usage.fileUploadsLimit)}
							</span>
						</div>
						<Progress value={calculatePercentage(usage.fileUploadsUsed, usage.fileUploadsLimit)} className="h-2" />
					</div>

					{/* Upgrade prompt if usage is high */}
					{(calculatePercentage(usage.questionsUsed, usage.questionsLimit) >= 80 ||
						calculatePercentage(usage.chatsUsed, usage.chatsLimit) >= 80 ||
						calculatePercentage(usage.fileUploadsUsed, usage.fileUploadsLimit) >= 80) && (
							<div className="pt-2 border-t">
								<Link href="/pricing">
									<Button variant="outline" size="sm" className="w-full">
										<TrendingUp className="h-4 w-4 mr-2" />
										Upgrade for More
									</Button>
								</Link>
							</div>
						)}
				</div>
			</CardContent>
		</Card>
	);
}
