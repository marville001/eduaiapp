'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { packagesApi } from '@/lib/api/subscriptions';
import { SubscriptionPackage } from '@/types/subscription';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
	const router = useRouter();
	const { isAuthenticated } = useAuth();

	const { data: packages, isLoading } = useQuery({
		queryKey: ['subscription-packages'],
		queryFn: packagesApi.getVisiblePackages,
	});

	const handleSubscribe = (pkg: SubscriptionPackage) => {
		if (!isAuthenticated) {
			router.push(`/login?redirect=/pricing`);
			return;
		}

		// Navigate to checkout
		router.push(`/app/subscription/checkout?packageId=${pkg.id}`);
	};

	const formatPrice = (pkg: SubscriptionPackage) => {
		const symbol = getCurrencySymbol(pkg.currency);
		return `${symbol}${pkg.price}`;
	};

	const formatBillingPeriod = (pkg: SubscriptionPackage) => {
		if (pkg.intervalCount === 1) {
			return `per ${pkg.billingInterval}`;
		}
		return `per ${pkg.intervalCount} ${pkg.billingInterval}s`;
	};

	const getCurrencySymbol = (currency: string) => {
		const symbols: Record<string, string> = {
			usd: '$',
			eur: '€',
			gbp: '£',
			jpy: '¥',
			cad: 'CA$',
			aud: 'AU$',
		};
		return symbols[currency.toLowerCase()] || currency.toUpperCase();
	};

	const getFeatureLimit = (limit?: number) => {
		if (!limit || limit === -1) return 'Unlimited';
		return limit.toString();
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-12">
			{/* Header */}
			<div className="text-center mb-12">
				<h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
				<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
					Select the perfect plan for your learning journey. Upgrade or downgrade anytime.
				</p>
			</div>

			{/* Pricing Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
				{packages
					?.sort((a, b) => a.displayOrder - b.displayOrder)
					.map((pkg) => (
						<Card
							key={pkg.id}
							className={`relative flex flex-col ${pkg.isFeatured ? 'border-primary shadow-xl scale-105' : ''
								}`}
						>
							{/* Badge */}
							{(pkg.badgeText || pkg.isPopular || pkg.isFeatured) && (
								<div className="absolute -top-4 left-1/2 -translate-x-1/2">
									<Badge
										className="px-4 py-1 text-sm font-semibold"
										style={pkg.badgeColor ? { backgroundColor: pkg.badgeColor } : undefined}
									>
										{pkg.isFeatured && <Sparkles className="h-3 w-3 mr-1 inline" />}
										{pkg.badgeText || (pkg.isPopular ? 'POPULAR' : pkg.isFeatured ? 'BEST VALUE' : '')}
									</Badge>
								</div>
							)}

							<CardHeader className="text-center pb-8 pt-6">
								<CardTitle className="text-2xl mb-2">{pkg.name}</CardTitle>
								{pkg.description && (
									<CardDescription className="text-base">{pkg.description}</CardDescription>
								)}

								<div className="mt-4">
									<div className="text-4xl font-bold">
										{pkg.price === 0 ? 'Free' : formatPrice(pkg)}
									</div>
									{pkg.price > 0 && (
										<div className="text-sm text-muted-foreground mt-1">
											{formatBillingPeriod(pkg)}
										</div>
									)}
								</div>

								{pkg.trialPeriodDays > 0 && (
									<div className="mt-2">
										<Badge variant="secondary" className="text-xs">
											{pkg.trialPeriodDays} days free trial
										</Badge>
									</div>
								)}
							</CardHeader>

							<CardContent className="grow">
								<ul className="space-y-3">
									{/* Usage limits */}
									<li className="flex items-start">
										<CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
										<span>
											<strong>{getFeatureLimit(pkg.maxQuestionsPerMonth)}</strong> questions per month
										</span>
									</li>
									<li className="flex items-start">
										<CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
										<span>
											<strong>{getFeatureLimit(pkg.maxChatsPerMonth)}</strong> AI chats per month
										</span>
									</li>
									<li className="flex items-start">
										<CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
										<span>
											<strong>{getFeatureLimit(pkg.maxFileUploads)}</strong> file uploads
										</span>
									</li>

									{/* Additional features */}
									{pkg.features?.map((feature, idx) => (
										<li key={idx} className="flex items-start">
											<CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
											<span>{feature}</span>
										</li>
									))}

									{pkg.prioritySupport && (
										<li className="flex items-start">
											<CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
											<span>Priority support</span>
										</li>
									)}

									{pkg.customBranding && (
										<li className="flex items-start">
											<CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
											<span>Custom branding</span>
										</li>
									)}
								</ul>
							</CardContent>

							<CardFooter>
								<Button
									className="w-full"
									size="lg"
									variant={pkg.isFeatured ? 'default' : 'outline'}
									onClick={() => handleSubscribe(pkg)}
								>
									{pkg.buttonText || 'Subscribe'}
								</Button>
							</CardFooter>
						</Card>
					))}
			</div>

			{/* FAQ or Additional Info */}
			<div className="mt-16 text-center">
				<p className="text-muted-foreground">
					All plans include access to our AI-powered learning platform. Need a custom plan?{' '}
					<Link href="/contact" className="text-primary hover:underline">
						Contact us
					</Link>
				</p>
			</div>
		</div>
	);
}
