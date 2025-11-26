'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function SuccessPage() {
	const searchParams = useSearchParams();
	const sessionId = searchParams.get('session_id');

	useEffect(() => {
		// Optional: Verify the session with your backend
		if (sessionId) {
			// You can make an API call here to verify the session
			console.log('Checkout session:', sessionId);
		}
	}, [sessionId]);

	return (
		<div className="container mx-auto px-4 py-12 max-w-2xl">
			<Card className="text-center">
				<CardHeader>
					<div className="flex justify-center mb-4">
						<div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
							<CheckCircle2 className="h-10 w-10 text-green-600" />
						</div>
					</div>
					<CardTitle className="text-3xl">Subscription Successful!</CardTitle>
					<CardDescription className="text-base">
						Thank you for subscribing. Your payment has been processed successfully.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-muted-foreground">
						Your subscription is now active. You can start using all the features included in your plan.
					</p>

					<div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
						<Link href="/app/subscription">
							<Button variant="outline">View Subscription</Button>
						</Link>
						<Link href="/app">
							<Button>Go to Dashboard</Button>
						</Link>
					</div>

					{sessionId && (
						<p className="text-xs text-muted-foreground pt-4">
							Session ID: {sessionId}
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
export default function SubscriptionSuccessPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SuccessPage />
		</Suspense>
	);
}