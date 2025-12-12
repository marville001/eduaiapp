/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { packagesApi, subscriptionsApi } from '@/lib/api/subscriptions';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';

function CheckoutPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { user, isAuthenticated } = useAuth();
	const [isRedirecting, setIsRedirecting] = useState(false);

	const packageId = searchParams.get('packageId');

	useEffect(() => {
		if (!isAuthenticated) {
			router.push('/login?redirect=/app/subscription/checkout');
		}
	}, [isAuthenticated, router]);

	const { data: pkg, isLoading: isLoadingPackage } = useQuery({
		queryKey: ['package', packageId],
		queryFn: () => packagesApi.getPackageById(Number(packageId)),
		enabled: !!packageId,
	});

	const createCheckoutMutation = useMutation({
		mutationFn: subscriptionsApi.createCheckoutSession,
		onSuccess: (data) => {
			setIsRedirecting(true);
			// Redirect to Stripe Checkout
			window.location.href = data.sessionUrl;
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Failed to create checkout session');
		},
	});

	const handleCheckout = () => {
		if (!packageId) return;

		const frontendUrl = window.location.origin;
		createCheckoutMutation.mutate({
			packageId: Number(packageId),
			successUrl: `${frontendUrl}/app/subscription/success`,
			cancelUrl: `${frontendUrl}/app/pricing`,
		});
	};

	const formatPrice = (price: number, currency: string) => {
		const symbol = getCurrencySymbol(currency);
		return `${symbol}${price}`;
	};

	const formatBillingPeriod = (intervalCount: number, interval: string) => {
		if (intervalCount === 1) {
			return `per ${interval}`;
		}
		return `per ${intervalCount} ${interval}s`;
	};

	const getCurrencySymbol = (currency: string) => {
		const symbols: Record<string, string> = {
			usd: '$',
			eur: '€',
			gbp: '£',
			jpy: '¥',
		};
		return symbols[currency.toLowerCase()] || currency.toUpperCase();
	};

	const getFeatureLimit = (limit?: number) => {
		if (!limit || limit === -1) return 'Unlimited';
		return limit.toString();
	};

	if (!packageId) {
		return (
			<div className="container mx-auto px-4 py-12 text-center">
				<p className="text-muted-foreground mb-4">No package selected</p>
				<Link href="/app/pricing">
					<Button>View Pricing</Button>
				</Link>
			</div>
		);
	}

	if (isLoadingPackage) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!pkg) {
		return (
			<div className="container mx-auto px-4 py-12 text-center">
				<p className="text-muted-foreground mb-4">Package not found</p>
				<Link href="/app/pricing">
					<Button>View Pricing</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-12 max-w-2xl">
			<div className="mb-8">
				<Link href="/pricing">
					<Button variant="ghost" size="sm">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Pricing
					</Button>
				</Link>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Checkout</CardTitle>
					<CardDescription>Review your subscription details</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Package Details */}
					<div className="border rounded-lg p-6 space-y-4">
						<div className="flex justify-between items-start">
							<div>
								<h3 className="text-xl font-semibold">{pkg.name}</h3>
								{pkg.description && <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>}
							</div>
							<div className="text-right">
								<div className="text-2xl font-bold">
									{pkg.price === 0 ? 'Free' : formatPrice(pkg.price, pkg.currency)}
								</div>
								{pkg.price > 0 && (
									<div className="text-sm text-muted-foreground">
										{formatBillingPeriod(pkg.intervalCount, pkg.billingInterval)}
									</div>
								)}
							</div>
						</div>

						{pkg.trialPeriodDays > 0 && (
							<div className="bg-primary/10 border border-primary/20 rounded-md p-3 text-sm">
								<strong>Free Trial:</strong> You won&apos;t be charged for {pkg.trialPeriodDays} days
							</div>
						)}

						<div className="border-t pt-4">
							<h4 className="font-semibold mb-3">What&apos;s included:</h4>
							<ul className="space-y-2">
								<li className="flex items-start">
									<CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
									<span>
										<strong>{getFeatureLimit(pkg.maxQuestionsPerMonth)}</strong> questions per month
									</span>
								</li>
								<li className="flex items-start">
									<CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
									<span>
										<strong>{getFeatureLimit(pkg.maxChatsPerMonth)}</strong> AI chats per month
									</span>
								</li>
								<li className="flex items-start">
									<CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
									<span>
										<strong>{getFeatureLimit(pkg.maxFileUploads)}</strong> file uploads
									</span>
								</li>

								{pkg.features?.map((feature, idx) => (
									<li key={idx} className="flex items-start">
										<CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
										<span>{feature}</span>
									</li>
								))}

								{pkg.prioritySupport && (
									<li className="flex items-start">
										<CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
										<span>Priority support</span>
									</li>
								)}
							</ul>
						</div>
					</div>

					{/* User Info */}
					<div className="border rounded-lg p-4 bg-muted/30">
						<p className="text-sm text-muted-foreground">
							<strong>Account:</strong> {user?.email}
						</p>
					</div>

					{/* Actions */}
					<div className="space-y-3">
						<Button
							className="w-full"
							size="lg"
							onClick={handleCheckout}
							disabled={createCheckoutMutation.isPending || isRedirecting}
						>
							{createCheckoutMutation.isPending || isRedirecting ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									{isRedirecting ? 'Redirecting to Stripe...' : 'Creating session...'}
								</>
							) : (
								'Continue to Payment'
							)}
						</Button>

						<p className="text-xs text-center text-muted-foreground">
							You will be redirected to Stripe to complete your payment securely
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default function Page() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CheckoutPage />
		</Suspense>
	);
}