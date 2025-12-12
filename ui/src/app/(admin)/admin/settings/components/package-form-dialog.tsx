"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { subscriptionPackagesApi } from "@/lib/api/stripe";
import {
	BillingInterval,
	CreateSubscriptionPackageDto,
	PackageType,
	SubscriptionPackage,
} from "@/types/stripe";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';
import * as z from "zod";

const formSchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	description: z.string().optional(),
	packageType: z.nativeEnum(PackageType),
	price: z.number(),
	currency: z.string().length(3),
	billingInterval: z.nativeEnum(BillingInterval),
	intervalCount: z.number().min(1),
	stripeProductId: z.string().optional(),
	stripePriceId: z.string().optional(),
	maxQuestionsPerMonth: z.number().optional(),
	maxChatsPerMonth: z.number().optional(),
	maxFileUploads: z.number().optional(),
	// prioritySupport: z.boolean(),
	// customBranding: z.boolean(),
	isActive: z.boolean(),
	isVisible: z.boolean(),
	isFeatured: z.boolean(),
	isPopular: z.boolean(),
	trialPeriodDays: z.number().min(0).max(365),
	creditsAllocation: z.number().min(-1).optional(), // -1 for unlimited
	creditMultiplier: z.number().min(0.01).max(10).optional(),
	displayOrder: z.number().min(0),
	badgeText: z.string().max(50).optional(),
	badgeColor: z.string().max(50).optional(),
	buttonText: z.string().max(50),
});

type FormData = z.infer<typeof formSchema>;

interface PackageFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	package?: SubscriptionPackage | null;
}

export function PackageFormDialog({
	open,
	onOpenChange,
	package: existingPackage,
}: PackageFormDialogProps) {
	const [features, setFeatures] = useState<string[]>([]);
	const [newFeature, setNewFeature] = useState("");
	const queryClient = useQueryClient();
	const isEdit = !!existingPackage;

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			packageType: PackageType.CUSTOM,
			price: 0,
			currency: "usd",
			billingInterval: BillingInterval.MONTH,
			intervalCount: 1,
			stripeProductId: "",
			stripePriceId: "",
			maxQuestionsPerMonth: undefined,
			maxChatsPerMonth: undefined,
			maxFileUploads: undefined,
			// prioritySupport: false,
			// customBranding: false,
			isActive: true,
			isVisible: true,
			isFeatured: false,
			isPopular: false,
			trialPeriodDays: 0,
			creditsAllocation: 0,
			creditMultiplier: 1,
			displayOrder: 0,
			badgeText: "",
			badgeColor: "",
			buttonText: "Subscribe",
		},
	});

	// Load existing package data
	useEffect(() => {
		if (existingPackage) {
			form.reset({
				name: existingPackage.name,
				description: existingPackage.description || "",
				packageType: existingPackage.packageType,
				price: existingPackage.price,
				currency: existingPackage.currency,
				billingInterval: existingPackage.billingInterval,
				intervalCount: existingPackage.intervalCount,
				stripeProductId: existingPackage.stripeProductId || "",
				stripePriceId: existingPackage.stripePriceId || "",
				maxQuestionsPerMonth: existingPackage.maxQuestionsPerMonth ?? undefined,
				maxChatsPerMonth: existingPackage.maxChatsPerMonth ?? undefined,
				maxFileUploads: existingPackage.maxFileUploads ?? undefined,
				// prioritySupport: existingPackage.prioritySupport,
				// customBranding: existingPackage.customBranding,
				isActive: existingPackage.isActive,
				isVisible: existingPackage.isVisible,
				isFeatured: existingPackage.isFeatured,
				isPopular: existingPackage.isPopular,
				trialPeriodDays: existingPackage.trialPeriodDays,
				creditsAllocation: existingPackage.creditsAllocation ?? 0,
				creditMultiplier: existingPackage.creditMultiplier ?? 1,
				displayOrder: existingPackage.displayOrder,
				badgeText: existingPackage.badgeText || "",
				badgeColor: existingPackage.badgeColor || "",
				buttonText: existingPackage.buttonText,
			});
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setFeatures(existingPackage.features || []);
		} else {
			form.reset();
			setFeatures([]);
		}
	}, [existingPackage, form]);	// Create mutation
	const createMutation = useMutation({
		mutationFn: (data: CreateSubscriptionPackageDto) =>
			subscriptionPackagesApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["subscription-packages"] });
			toast.success("Package created successfully");
			onOpenChange(false);
			form.reset();
			setFeatures([]);
		},
		onError: () => {
			toast.error("Failed to create package");
		},
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: (data: CreateSubscriptionPackageDto) =>
			subscriptionPackagesApi.update(existingPackage!.id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["subscription-packages"] });
			toast.success("Package updated successfully");
			onOpenChange(false);
		},
		onError: () => {
			toast.error("Failed to update package");
		},
	});
	console.log(form.formState.errors);


	const onSubmit = (data: FormData) => {
		const payload: CreateSubscriptionPackageDto = {
			...data,
			features,
			// Convert empty strings to undefined
			description: data.description || undefined,
			stripeProductId: data.stripeProductId || undefined,
			stripePriceId: data.stripePriceId || undefined,
			badgeText: data.badgeText || undefined,
			badgeColor: data.badgeColor || undefined,
			maxQuestionsPerMonth: data.maxQuestionsPerMonth ?? undefined,
			maxChatsPerMonth: data.maxChatsPerMonth ?? undefined,
			maxFileUploads: data.maxFileUploads ?? undefined,
			creditsAllocation: data.creditsAllocation ?? 0,
			creditMultiplier: data.creditMultiplier ?? 1,
		};

		if (isEdit) {
			updateMutation.mutate(payload);
		} else {
			createMutation.mutate(payload);
		}
	};

	const addFeature = () => {
		if (newFeature.trim()) {
			setFeatures([...features, newFeature.trim()]);
			setNewFeature("");
		}
	};

	const removeFeature = (index: number) => {
		setFeatures(features.filter((_, i) => i !== index));
	};

	const isPending = createMutation.isPending || updateMutation.isPending;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Edit Package" : "Create New Package"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the subscription package details"
							: "Create a new subscription package for your platform"}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Basic Information */}
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Basic Information</h3>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Package Name *</FormLabel>
											<FormControl>
												<Input placeholder="e.g., Premium Plan" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="packageType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Package Type</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value={PackageType.FREE}>Free</SelectItem>
													<SelectItem value={PackageType.BASIC}>Basic</SelectItem>
													<SelectItem value={PackageType.PREMIUM}>
														Premium
													</SelectItem>
													<SelectItem value={PackageType.ENTERPRISE}>
														Enterprise
													</SelectItem>
													<SelectItem value={PackageType.CUSTOM}>Custom</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Describe what this package offers..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Pricing */}
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Pricing</h3>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="price"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Price *</FormLabel>
											<FormControl>
												<Input
													{...field}
													onChange={(e) => {
														try {
															const value = Number(e.target.value);
															field.onChange(value);
														} catch (error) {
															console.error(error);
														}
													}
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="currency"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Currency</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="usd">USD ($)</SelectItem>
													<SelectItem value="eur">EUR (€)</SelectItem>
													<SelectItem value="gbp">GBP (£)</SelectItem>
													<SelectItem value="cad">CAD (CA$)</SelectItem>
													<SelectItem value="aud">AUD (AU$)</SelectItem>
													<SelectItem value="jpy">JPY (¥)</SelectItem>
													<SelectItem value="inr">INR (₹)</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="billingInterval"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Billing Interval</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value={BillingInterval.DAY}>Day</SelectItem>
													<SelectItem value={BillingInterval.WEEK}>Week</SelectItem>
													<SelectItem value={BillingInterval.MONTH}>
														Month
													</SelectItem>
													<SelectItem value={BillingInterval.YEAR}>Year</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="intervalCount"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Interval Count</FormLabel>
											<FormControl>
												<Input
													type="number"
													min="1"
													{...field}
													onChange={(e) =>
														field.onChange(parseInt(e.target.value, 10) || 1)
													}
												/>
											</FormControl>
											<FormDescription>
												e.g., 3 months = interval 3
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="trialPeriodDays"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Trial Period (Days)</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
												max="365"
												{...field}
												onChange={(e) =>
													field.onChange(parseInt(e.target.value, 10) || 0)
												}
											/>
										</FormControl>
										<FormDescription>0 for no trial period</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Features */}
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Features</h3>

							<div className="flex gap-2">
								<Input
									placeholder="Add a feature..."
									value={newFeature}
									onChange={(e) => setNewFeature(e.target.value)}
									onKeyPress={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											addFeature();
										}
									}}
								/>
								<Button type="button" onClick={addFeature}>
									<Plus className="h-4 w-4" />
								</Button>
							</div>

							{features.length > 0 && (
								<div className="space-y-2">
									{features.map((feature, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-2 bg-secondary rounded-md"
										>
											<span className="text-sm">{feature}</span>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => removeFeature(index)}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Limits */}
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Usage Limits</h3>

							<div className="grid grid-cols-3 gap-4">
								<FormField
									control={form.control}
									name="maxQuestionsPerMonth"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Questions/Month</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="Unlimited"
													{...field}
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(
															e.target.value ? parseInt(e.target.value, 10) : undefined
														)
													}
												/>
											</FormControl>
											<FormDescription>-1 for unlimited</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="maxChatsPerMonth"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Chats/Month</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="Unlimited"
													{...field}
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(
															e.target.value ? parseInt(e.target.value, 10) : undefined
														)
													}
												/>
											</FormControl>
											<FormDescription>-1 for unlimited</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="maxFileUploads"
									render={({ field }) => (
										<FormItem>
											<FormLabel>File Uploads</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="Unlimited"
													{...field}
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(
															e.target.value ? parseInt(e.target.value, 10) : undefined
														)
													}
												/>
											</FormControl>
											<FormDescription>-1 for unlimited</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Credit Settings */}
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Credit Settings</h3>
							<p className="text-sm text-muted-foreground">
								Configure the credits allocation for this subscription plan
							</p>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="creditsAllocation"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Credits per Billing Cycle</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="0"
													{...field}
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(
															e.target.value ? parseInt(e.target.value, 10) : 0
														)
													}
												/>
											</FormControl>
											<FormDescription>
												Credits given each billing period. Use -1 for unlimited.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="creditMultiplier"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Credit Multiplier</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.01"
													min="0.01"
													max="10"
													placeholder="1.00"
													{...field}
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(
															e.target.value ? parseFloat(e.target.value) : 1
														)
													}
												/>
											</FormControl>
											<FormDescription>
												Cost multiplier (1.0 = normal, 0.5 = half cost)
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Stripe Integration */}
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Stripe Integration</h3>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="stripeProductId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Stripe Product ID</FormLabel>
											<FormControl>
												<Input placeholder="prod_..." {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="stripePriceId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Stripe Price ID</FormLabel>
											<FormControl>
												<Input placeholder="price_..." {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Display Settings */}
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Display Settings</h3>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="displayOrder"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Display Order</FormLabel>
											<FormControl>
												<Input
													type="number"
													min="0"
													{...field}
													onChange={(e) =>
														field.onChange(parseInt(e.target.value, 10) || 0)
													}
												/>
											</FormControl>
											<FormDescription>Lower numbers appear first</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="buttonText"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Button Text</FormLabel>
											<FormControl>
												<Input placeholder="Subscribe" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="badgeText"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Badge Text</FormLabel>
											<FormControl>
												<Input placeholder="BEST VALUE" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="badgeColor"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Badge Color</FormLabel>
											<FormControl>
												<Input
													type="color"
													{...field}
													className="h-10"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Toggles */}
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Options</h3>

							<div className="space-y-4">
								{/* <FormField
									control={form.control}
									name="prioritySupport"
									render={({ field }) => (
										<FormItem className="flex items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel>Priority Support</FormLabel>
												<FormDescription>
													Subscribers get priority customer support
												</FormDescription>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="customBranding"
									render={({ field }) => (
										<FormItem className="flex items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel>Custom Branding</FormLabel>
												<FormDescription>
													Allow custom branding options
												</FormDescription>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/> */}

								<FormField
									control={form.control}
									name="isActive"
									render={({ field }) => (
										<FormItem className="flex items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel>Active</FormLabel>
												<FormDescription>
													Package is active and can be purchased
												</FormDescription>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="isVisible"
									render={({ field }) => (
										<FormItem className="flex items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel>Visible</FormLabel>
												<FormDescription>
													Show package on pricing page
												</FormDescription>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="isFeatured"
									render={({ field }) => (
										<FormItem className="flex items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel>Featured</FormLabel>
												<FormDescription>
													Highlight as featured package
												</FormDescription>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="isPopular"
									render={({ field }) => (
										<FormItem className="flex items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel>Popular</FormLabel>
												<FormDescription>
													Mark as popular choice
												</FormDescription>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{isEdit ? "Updating..." : "Creating..."}
									</>
								) : (
									<>{isEdit ? "Update Package" : "Create Package"}</>
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
