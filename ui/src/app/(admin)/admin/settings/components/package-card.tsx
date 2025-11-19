"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { subscriptionPackagesApi } from "@/lib/api/stripe";
import { PackageType, SubscriptionPackage } from "@/types/stripe";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Check,
	Copy,
	Crown,
	Edit,
	Eye,
	EyeOff,
	MoreVertical,
	Star,
	Trash2,
	TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface PackageCardProps {
	package: SubscriptionPackage;
	onEdit: (pkg: SubscriptionPackage) => void;
}

export function PackageCard({ package: pkg, onEdit }: PackageCardProps) {
	const queryClient = useQueryClient();

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: () => subscriptionPackagesApi.delete(pkg.id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["subscription-packages"] });
			toast.success("Package deleted successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to delete package", {
				description: error.message,
			});
		},
	});

	// Toggle visibility mutation
	const toggleVisibilityMutation = useMutation({
		mutationFn: () => subscriptionPackagesApi.toggleVisibility(pkg.id),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["subscription-packages"] });
			toast.success(data.message);
		},
		onError: (error: Error) => {
			toast.error("Failed to toggle visibility", {
				description: error.message,
			});
		},
	});

	// Toggle active mutation
	const toggleActiveMutation = useMutation({
		mutationFn: () => subscriptionPackagesApi.toggleActive(pkg.id),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["subscription-packages"] });
			toast.success(data.message);
		},
		onError: (error: Error) => {
			toast.error("Failed to toggle active status", {
				description: error.message,
			});
		},
	});

	// Toggle featured mutation
	const toggleFeaturedMutation = useMutation({
		mutationFn: () => subscriptionPackagesApi.toggleFeatured(pkg.id),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["subscription-packages"] });
			toast.success(data.message);
		},
		onError: (error: Error) => {
			toast.error("Failed to toggle featured status", {
				description: error.message,
			});
		},
	});

	const handleDelete = () => {
		if (pkg.packageType === PackageType.FREE) {
			toast.error("Cannot delete the free package");
			return;
		}

		if (
			window.confirm(
				`Are you sure you want to delete "${pkg.name}"? This action cannot be undone.`
			)
		) {
			deleteMutation.mutate();
		}
	};

	const getCurrencySymbol = (currency: string) => {
		const symbols: Record<string, string> = {
			usd: "$",
			eur: "€",
			gbp: "£",
			jpy: "¥",
			cad: "CA$",
			aud: "AU$",
			inr: "₹",
		};
		return symbols[currency.toLowerCase()] || currency.toUpperCase();
	};

	const getBillingPeriod = () => {
		if (pkg.intervalCount === 1) {
			return `per ${pkg.billingInterval}`;
		}
		return `per ${pkg.intervalCount} ${pkg.billingInterval}s`;
	};

	const getPackageTypeColor = (type: PackageType) => {
		switch (type) {
			case PackageType.FREE:
				return "bg-gray-100 text-gray-800";
			case PackageType.BASIC:
				return "bg-blue-100 text-blue-800";
			case PackageType.PREMIUM:
				return "bg-purple-100 text-purple-800";
			case PackageType.ENTERPRISE:
				return "bg-amber-100 text-amber-800";
			default:
				return "bg-slate-100 text-slate-800";
		}
	};

	return (
		<Card className={`relative ${!pkg.isActive ? "opacity-60" : ""}`}>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-2">
							<CardTitle className="text-xl">{pkg.name}</CardTitle>
							<Badge className={getPackageTypeColor(pkg.packageType)}>
								{pkg.packageType}
							</Badge>
						</div>
						<div className="flex items-center gap-2 flex-wrap">
							{!pkg.isActive && (
								<Badge variant="secondary" className="bg-red-100 text-red-800">
									Inactive
								</Badge>
							)}
							{!pkg.isVisible && (
								<Badge variant="secondary" className="bg-amber-100 text-amber-800">
									Hidden
								</Badge>
							)}
							{pkg.isFeatured && (
								<Badge variant="secondary" className="bg-green-100 text-green-800">
									<Crown className="h-3 w-3 mr-1" />
									Featured
								</Badge>
							)}
							{pkg.isPopular && (
								<Badge variant="secondary" className="bg-orange-100 text-orange-800">
									<TrendingUp className="h-3 w-3 mr-1" />
									Popular
								</Badge>
							)}
						</div>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm">
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => onEdit(pkg)}>
								<Edit className="h-4 w-4 mr-2" />
								Edit Package
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => toggleVisibilityMutation.mutate()}>
								{pkg.isVisible ? (
									<EyeOff className="h-4 w-4 mr-2" />
								) : (
									<Eye className="h-4 w-4 mr-2" />
								)}
								{pkg.isVisible ? "Hide" : "Show"} Package
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => toggleActiveMutation.mutate()}>
								{pkg.isActive ? "Deactivate" : "Activate"}
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => toggleFeaturedMutation.mutate()}>
								<Star className="h-4 w-4 mr-2" />
								{pkg.isFeatured ? "Unfeature" : "Feature"}
							</DropdownMenuItem>
							{pkg.stripePriceId && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => {
											navigator.clipboard.writeText(pkg.stripePriceId!);
											toast.success("Stripe Price ID copied");
										}}
									>
										<Copy className="h-4 w-4 mr-2" />
										Copy Stripe ID
									</DropdownMenuItem>
								</>
							)}
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={handleDelete}
								className="text-red-600"
								disabled={pkg.packageType === PackageType.FREE}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete Package
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Pricing */}
				<div>
					<div className="flex items-baseline gap-2">
						<span className="text-3xl font-bold">
							{getCurrencySymbol(pkg.currency)}
							{pkg.price}
						</span>
						<span className="text-muted-foreground">
							{getBillingPeriod()}
						</span>
					</div>
					{pkg.trialPeriodDays > 0 && (
						<p className="text-sm text-green-600 mt-1">
							{pkg.trialPeriodDays} day free trial
						</p>
					)}
				</div>

				{/* Description */}
				{pkg.description && (
					<p className="text-sm text-muted-foreground">{pkg.description}</p>
				)}

				{/* Features */}
				{pkg.features && pkg.features.length > 0 && (
					<div className="space-y-2">
						<p className="text-sm font-medium">Features:</p>
						<ul className="space-y-1">
							{pkg.features.slice(0, 5).map((feature, index) => (
								<li key={index} className="flex items-start gap-2 text-sm">
									<Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
									<span>{feature}</span>
								</li>
							))}
							{pkg.features.length > 5 && (
								<li className="text-sm text-muted-foreground pl-6">
									+{pkg.features.length - 5} more features
								</li>
							)}
						</ul>
					</div>
				)}

				{/* Limits */}
				<div className="grid grid-cols-2 gap-2 text-sm">
					{pkg.maxQuestionsPerMonth !== null && (
						<div className="space-y-1">
							<p className="text-muted-foreground">Questions/month</p>
							<p className="font-medium">
								{pkg.maxQuestionsPerMonth === -1
									? "Unlimited"
									: pkg.maxQuestionsPerMonth}
							</p>
						</div>
					)}
					{pkg.maxChatsPerMonth !== null && (
						<div className="space-y-1">
							<p className="text-muted-foreground">Chats/month</p>
							<p className="font-medium">
								{pkg.maxChatsPerMonth === -1
									? "Unlimited"
									: pkg.maxChatsPerMonth}
							</p>
						</div>
					)}
				</div>

				{/* Perks */}
				<div className="flex flex-wrap gap-2">
					{pkg.prioritySupport && (
						<Badge variant="outline" className="text-xs">
							Priority Support
						</Badge>
					)}
					{pkg.customBranding && (
						<Badge variant="outline" className="text-xs">
							Custom Branding
						</Badge>
					)}
				</div>

				{/* Stripe Integration */}
				{pkg.stripePriceId && (
					<div className="p-2 bg-green-50 rounded-md">
						<p className="text-xs text-green-800 font-medium">
							✓ Integrated with Stripe
						</p>
						<p className="text-xs text-green-600 font-mono mt-1 truncate">
							{pkg.stripePriceId}
						</p>
					</div>
				)}
			</CardContent>

			<CardFooter className="text-xs text-muted-foreground">
				<div className="flex items-center justify-between w-full">
					<span>Order: {pkg.displayOrder}</span>
					<span>ID: {pkg.id}</span>
				</div>
			</CardFooter>

			{/* Custom Badge */}
			{pkg.badgeText && (
				<div
					className="absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold shadow-md"
					style={{
						backgroundColor: pkg.badgeColor || "#10B981",
						color: "white",
					}}
				>
					{pkg.badgeText}
				</div>
			)}
		</Card>
	);
}
