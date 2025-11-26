'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import { useQuery } from '@tanstack/react-query';
import { Lock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface SubscriptionGateProps {
	children: ReactNode;
	action: 'question' | 'chat' | 'upload';
	fallback?: ReactNode;
}

export function SubscriptionGate({ children, action, fallback }: SubscriptionGateProps) {
	const { data: canPerform, isLoading } = useQuery({
		queryKey: ['can-perform', action],
		queryFn: () => subscriptionsApi.canPerformAction(action),
	});

	if (isLoading) {
		return <>{children}</>;
	}

	if (canPerform && !canPerform.canPerform) {
		if (fallback) {
			return <>{fallback}</>;
		}

		const actionLabels = {
			question: 'ask questions',
			chat: 'start AI chats',
			upload: 'upload files',
		};

		return (
			<Alert>
				<Lock className="h-4 w-4" />
				<AlertTitle>Upgrade Required</AlertTitle>
				<AlertDescription className="space-y-2">
					<p>
						You've reached your limit to {actionLabels[action]}. Upgrade your plan to continue.
					</p>
					<Link href="/pricing">
						<Button size="sm" className="mt-2">
							<TrendingUp className="h-4 w-4 mr-2" />
							View Plans
						</Button>
					</Link>
				</AlertDescription>
			</Alert>
		);
	}

	return <>{children}</>;
}
