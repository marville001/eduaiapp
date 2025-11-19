"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { subscriptionPackagesApi } from "@/lib/api/stripe";
import { SubscriptionPackage } from "@/types/stripe";
import { useQuery } from "@tanstack/react-query";
import {
	Loader2,
	Plus,
	Search
} from "lucide-react";
import { useState } from "react";
import { PackageCard } from "./package-card";
import { PackageFormDialog } from "./package-form-dialog";

export function PackagesTab() {
	const [searchQuery, setSearchQuery] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);

	// Fetch all packages
	const { data: packages = [], isLoading } = useQuery({
		queryKey: ["subscription-packages", "all"],
		queryFn: () => subscriptionPackagesApi.getAllPackages(),
	});

	// Fetch statistics
	// const { data: stats } = useQuery({
	// 	queryKey: ["subscription-packages", "stats"],
	// 	queryFn: () => subscriptionPackagesApi.getStats(),
	// });

	// Filter packages by search query
	const filteredPackages = packages.filter((pkg) => {
		const query = searchQuery.toLowerCase();
		return (
			pkg.name.toLowerCase().includes(query) ||
			pkg.description?.toLowerCase().includes(query) ||
			pkg.packageType.toLowerCase().includes(query)
		);
	});

	// Sort packages by display order
	const sortedPackages = [...filteredPackages].sort(
		(a, b) => a.displayOrder - b.displayOrder
	);

	const handleEdit = (pkg: SubscriptionPackage) => {
		setSelectedPackage(pkg);
		setIsDialogOpen(true);
	};

	const handleCreate = () => {
		setSelectedPackage(null);
		setIsDialogOpen(true);
	};

	const handleCloseDialog = () => {
		setIsDialogOpen(false);
		setSelectedPackage(null);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Statistics Cards */}
			{/* <div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Packages</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats?.total ?? packages.length}
						</div>
						<p className="text-xs text-muted-foreground">
							All subscription packages
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Packages</CardTitle>
						<CreditCard className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats?.active ??
								packages.filter((p) => p.isActive).length}
						</div>
						<p className="text-xs text-muted-foreground">
							Currently accepting subscriptions
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Visible Packages
						</CardTitle>
						<Eye className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats?.visible ??
								packages.filter((p) => p.isVisible).length}
						</div>
						<p className="text-xs text-muted-foreground">
							Shown on pricing page
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Featured Packages
						</CardTitle>
						<Star className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats?.featured ??
								packages.filter((p) => p.isFeatured).length}
						</div>
						<p className="text-xs text-muted-foreground">
							Highlighted to users
						</p>
					</CardContent>
				</Card>
			</div> */}

			{/* Header with Search and Create */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4 flex-1">
					<div className="relative flex-1 max-w-sm">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search packages..."
							className="pl-8"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>
				<Button onClick={handleCreate}>
					<Plus className="mr-2 h-4 w-4" />
					Create Package
				</Button>
			</div>

			{/* Packages Grid */}
			{sortedPackages.length === 0 ? (
				<Card>
					<CardHeader>
						<CardTitle>No packages found</CardTitle>
						<CardDescription>
							{searchQuery
								? "No packages match your search. Try adjusting your search terms."
								: "Get started by creating your first subscription package."}
						</CardDescription>
					</CardHeader>
					{!searchQuery && (
						<CardContent>
							<Button onClick={handleCreate}>
								<Plus className="mr-2 h-4 w-4" />
								Create Your First Package
							</Button>
						</CardContent>
					)}
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{sortedPackages.map((pkg) => (
						<PackageCard key={pkg.id} package={pkg} onEdit={handleEdit} />
					))}
				</div>
			)}

			{/* Package Form Dialog */}
			<PackageFormDialog
				open={isDialogOpen}
				onOpenChange={handleCloseDialog}
				package={selectedPackage}
			/>
		</div>
	);
}
