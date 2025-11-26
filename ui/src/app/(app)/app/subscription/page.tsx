/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { packagesApi, subscriptionsApi } from '@/lib/api/subscriptions';
import { SubscriptionStatus } from '@/types/subscription';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AlertCircle, CreditCard, ExternalLink, Loader2, TrendingUp, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SubscriptionManagementPage() {
	const queryClient = useQueryClient();
	const [showCancelDialog, setShowCancelDialog] = useState(false);
	const [showReactivateDialog, setShowReactivateDialog] = useState(false);

	const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
		queryKey: ['current-subscription'],
		queryFn: subscriptionsApi.getCurrentSubscription,
	});

	const { data: usage, isLoading: isLoadingUsage } = useQuery({
		queryKey: ['usage-statistics'],
		queryFn: subscriptionsApi.getUsageStatistics,
	});

	const { data: packages } = useQuery({
		queryKey: ['subscription-packages'],
		queryFn: packagesApi.getVisiblePackages,
	});

	const cancelMutation = useMutation({
		mutationFn: () => subscriptionsApi.cancelSubscription({ cancelAtPeriodEnd: true }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
			toast.success('Subscription will be canceled at the end of billing period');
			setShowCancelDialog(false);
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Failed to cancel subscription');
		},
	});

	const reactivateMutation = useMutation({
		mutationFn: subscriptionsApi.reactivateSubscription,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
			toast.success('Subscription reactivated successfully');
			setShowReactivateDialog(false);
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Failed to reactivate subscription');
		},
	});

	const billingPortalMutation = useMutation({
		mutationFn: subscriptionsApi.getBillingPortal,
		onSuccess: (data) => {
			window.location.href = data.url;
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Failed to open billing portal');
		},
	});

	const getStatusBadge = (status: SubscriptionStatus) => {
		const statusConfig = {
			[SubscriptionStatus.ACTIVE]: { label: 'Active', variant: 'default' as const },
			[SubscriptionStatus.TRIALING]: { label: 'Trial', variant: 'secondary' as const },
			[SubscriptionStatus.CANCELED]: { label: 'Canceled', variant: 'destructive' as const },
			[SubscriptionStatus.PAST_DUE]: { label: 'Past Due', variant: 'destructive' as const },
			[SubscriptionStatus.UNPAID]: { label: 'Unpaid', variant: 'destructive' as const },
			[SubscriptionStatus.INCOMPLETE]: { label: 'Incomplete', variant: 'secondary' as const },
			[SubscriptionStatus.INCOMPLETE_EXPIRED]: { label: 'Expired', variant: 'destructive' as const },
			[SubscriptionStatus.PAUSED]: { label: 'Paused', variant: 'secondary' as const },
		};

		const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
		return <Badge variant={config.variant}>{config.label}</Badge>;
	};

	const calculatePercentage = (used: number, limit: number | string) => {
		if (limit === 'Unlimited' || limit === -1) return 0;
		const numLimit = typeof limit === 'string' ? parseInt(limit) : limit;
		return Math.min((used / numLimit) * 100, 100);
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return 'N/A';
		return format(new Date(dateString), 'MMM dd, yyyy');
	};

	if (isLoadingSubscription || isLoadingUsage) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!subscription) {
		return (
			<div className="container mx-auto px-4 py-12 max-w-4xl">
				<Card>
					<CardHeader className="text-center">
						<CardTitle>No Active Subscription</CardTitle>
						<CardDescription>You don&apos;t have an active subscription yet</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<p className="text-muted-foreground mb-6">
							Choose a plan to unlock premium features and get the most out of our platform.
						</p>
						<Link href="/app/pricing">
							<Button>View Pricing Plans</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-12 max-w-4xl space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold mb-2">Subscription</h1>
				<p className="text-muted-foreground">Manage your subscription and billing</p>
			</div>

			{/* Cancellation Warning */}
			{subscription.cancelAtPeriodEnd && (
				<Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
					<CardHeader>
						<div className="flex items-start gap-3">
							<AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
							<div>
								<CardTitle className="text-lg">Subscription Ending</CardTitle>
								<CardDescription className="text-orange-700 dark:text-orange-300">
									Your subscription will end on {formatDate(subscription.currentPeriodEnd)}
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<Button variant="outline" onClick={() => setShowReactivateDialog(true)}>
							Reactivate Subscription
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Current Plan */}
			<Card>
				<CardHeader>
					<div className="flex justify-between items-start">
						<div>
							<CardTitle>Current Plan</CardTitle>
							<CardDescription>Your subscription details</CardDescription>
						</div>
						{getStatusBadge(subscription.status)}
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-muted-foreground">Plan</p>
							<p className="text-lg font-semibold">{subscription.package?.name || 'N/A'}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Amount</p>
							<p className="text-lg font-semibold">
								{subscription.currency.toUpperCase()} ${subscription.amount || '0.00'}
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Billing Period</p>
							<p className="text-lg font-semibold">
								{formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Next Billing Date</p>
							<p className="text-lg font-semibold">{formatDate(subscription.currentPeriodEnd)}</p>
						</div>
					</div>

					<div className="flex flex-wrap gap-3 pt-4">
						<Button
							variant="outline"
							onClick={() => billingPortalMutation.mutate()}
							disabled={billingPortalMutation.isPending}
						>
							{billingPortalMutation.isPending ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : (
								<CreditCard className="h-4 w-4 mr-2" />
							)}
							Manage Billing
							<ExternalLink className="h-3 w-3 ml-2" />
						</Button>

						{!subscription.cancelAtPeriodEnd && subscription.status === SubscriptionStatus.ACTIVE && (
							<Button variant="outline" onClick={() => setShowCancelDialog(true)}>
								<XCircle className="h-4 w-4 mr-2" />
								Cancel Subscription
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Usage Statistics */}
			{usage && (
				<Card>
					<CardHeader>
						<CardTitle>Usage Statistics</CardTitle>
						<CardDescription>Your current usage for this billing period</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Questions */}
						<div>
							<div className="flex justify-between mb-2">
								<span className="text-sm font-medium">Questions Asked</span>
								<span className="text-sm text-muted-foreground">
									{usage.questionsUsed} / {usage.questionsRemaining === 'Unlimited' ? '∞' : usage.questionsLimit}
								</span>
							</div>
							<Progress value={calculatePercentage(usage.questionsUsed, usage.questionsLimit)} />
						</div>

						{/* Chats */}
						<div>
							<div className="flex justify-between mb-2">
								<span className="text-sm font-medium">AI Chats</span>
								<span className="text-sm text-muted-foreground">
									{usage.chatsUsed} / {usage.chatsRemaining === 'Unlimited' ? '∞' : usage.chatsLimit}
								</span>
							</div>
							<Progress value={calculatePercentage(usage.chatsUsed, usage.chatsLimit)} />
						</div>

						{/* File Uploads */}
						<div>
							<div className="flex justify-between mb-2">
								<span className="text-sm font-medium">File Uploads</span>
								<span className="text-sm text-muted-foreground">
									{usage.fileUploadsUsed} / {usage.fileUploadsRemaining === 'Unlimited' ? '∞' : usage.fileUploadsLimit}
								</span>
							</div>
							<Progress value={calculatePercentage(usage.fileUploadsUsed, usage.fileUploadsLimit)} />
						</div>

						{usage.usageResetAt && (
							<p className="text-xs text-muted-foreground">
								Usage will reset on {formatDate(usage.currentPeriodEnd)}
							</p>
						)}
					</CardContent>
				</Card>
			)}

			{/* Upgrade Options */}
			{packages && packages.length > 0 && subscription.status === SubscriptionStatus.ACTIVE && (
				<Card>
					<CardHeader>
						<CardTitle>Upgrade Your Plan</CardTitle>
						<CardDescription>Get more features with a higher tier plan</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{packages
								.filter((pkg) => pkg.id !== subscription.packageId && pkg.price > (subscription.amount || 0))
								.map((pkg) => (
									<div key={pkg.id} className="border rounded-lg p-4 space-y-2">
										<div className="flex justify-between items-start">
											<div>
												<h4 className="font-semibold">{pkg.name}</h4>
												<p className="text-sm text-muted-foreground">{pkg.description}</p>
											</div>
											{pkg.isFeatured && <Badge>Recommended</Badge>}
										</div>
										<p className="text-2xl font-bold">
											${pkg.price}/{pkg.billingInterval}
										</p>
										<Link href={`/subscription/checkout?packageId=${pkg.id}`}>
											<Button className="w-full" size="sm">
												<TrendingUp className="h-4 w-4 mr-2" />
												Upgrade
											</Button>
										</Link>
									</div>
								))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Cancel Dialog */}
			<AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
						<AlertDialogDescription>
							Your subscription will remain active until the end of your current billing period (
							{formatDate(subscription.currentPeriodEnd)}). After that, you will lose access to premium features.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Keep Subscription</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => cancelMutation.mutate()}
							disabled={cancelMutation.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{cancelMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Cancel Subscription
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Reactivate Dialog */}
			<AlertDialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Reactivate Subscription?</AlertDialogTitle>
						<AlertDialogDescription>
							Your subscription will continue as normal and you will be charged at the next billing date.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => reactivateMutation.mutate()}
							disabled={reactivateMutation.isPending}
						>
							{reactivateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Reactivate
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
