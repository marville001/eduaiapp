"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { stripeSettingsApi } from "@/lib/api/stripe";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	CheckCircle2,
	CreditCard,
	Eye,
	EyeOff,
	Loader2,
	RefreshCw,
	Save,
	Shield,
	XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';
import * as z from "zod";

const formSchema = z.object({
	publishableKey: z.string().optional(),
	secretKey: z.string().optional(),
	webhookSecret: z.string().optional(),
	trialPeriodDays: z.number().min(0).max(365),
	currency: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export default function StripeSettingsTab() {
	const [showSecretKey, setShowSecretKey] = useState(false);
	const [showWebhookSecret, setShowWebhookSecret] = useState(false);
	const queryClient = useQueryClient();

	// Fetch Stripe settings
	const { data: settings, isLoading } = useQuery({
		queryKey: ["stripe-settings"],
		queryFn: stripeSettingsApi.getSettings,
	});

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			publishableKey: "",
			secretKey: "",
			webhookSecret: "",
			trialPeriodDays: 0,
			currency: "usd",
		},
	});

	// Update form when settings load
	React.useEffect(() => {
		if (settings) {
			form.reset({
				publishableKey: settings.publishableKey || "",
				secretKey: "", // Never populate encrypted keys
				webhookSecret: "",
				trialPeriodDays: settings.trialPeriodDays,
				currency: settings.currency,
			});
		}
	}, [settings, form]);

	// Update settings mutation
	const updateMutation = useMutation({
		mutationFn: stripeSettingsApi.updateSettings,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["stripe-settings"] });
			toast.success("Stripe settings updated successfully");
			// Clear sensitive fields after update
			form.setValue("secretKey", "");
			form.setValue("webhookSecret", "");
		},
		onError: () => {
			toast.error("Failed to update Stripe settings");
		},
	});

	// Test connection mutation
	const testConnectionMutation = useMutation({
		mutationFn: stripeSettingsApi.testConnection,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["stripe-settings"] });

			console.log(data);

			if (data.success) {
				toast.success(data.message);
			} else {
				toast.error(data.message);
			}
		},
		onError: () => {
			toast.error("Connection test failed");
		},
	});

	// Toggle enabled mutation
	const toggleEnabledMutation = useMutation({
		mutationFn: stripeSettingsApi.toggleEnabled,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["stripe-settings"] });
			toast.success(data.message);
		},
		onError: () => {
			toast.error("Failed to toggle Stripe status");
		},
	});

	// Toggle subscriptions mutation
	const toggleSubscriptionsMutation = useMutation({
		mutationFn: stripeSettingsApi.toggleSubscriptions,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["stripe-settings"] });
			toast.success(data.message);
		},
		onError: () => {
			toast.error("Failed to toggle subscriptions");
		},
	});

	const onSubmit = (data: FormData) => {
		const updateData: Partial<FormData> = {};

		// Only include changed fields
		if (data.publishableKey !== settings?.publishableKey) {
			updateData.publishableKey = data.publishableKey;
		}
		if (data.secretKey) {
			updateData.secretKey = data.secretKey;
		}
		if (data.webhookSecret) {
			updateData.webhookSecret = data.webhookSecret;
		}
		if (data.trialPeriodDays !== settings?.trialPeriodDays) {
			updateData.trialPeriodDays = data.trialPeriodDays;
		}
		if (data.currency !== settings?.currency) {
			updateData.currency = data.currency;
		}

		updateMutation.mutate(updateData);
	};

	const handleTestConnection = () => {
		testConnectionMutation.mutate();
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-12">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header with Status */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<CardTitle className="flex items-center gap-2">
								<CreditCard className="h-5 w-5" />
								Stripe Configuration
							</CardTitle>
							<CardDescription>
								Configure Stripe payment gateway for subscription management
							</CardDescription>
						</div>
						<div className="flex items-center gap-3">
							{settings?.lastConnectionTestAt && (
								<div className="text-sm text-muted-foreground">
									{settings.lastConnectionSuccessful ? (
										<div className="flex items-center gap-2 text-green-600">
											<CheckCircle2 className="h-4 w-4" />
											<span>Connected</span>
										</div>
									) : (
										<div className="flex items-center gap-2 text-red-600">
											<XCircle className="h-4 w-4" />
											<span>Connection Failed</span>
										</div>
									)}
								</div>
							)}
							<Button
								variant="outline"
								size="sm"
								onClick={handleTestConnection}
								disabled={testConnectionMutation.isPending}
							>
								{testConnectionMutation.isPending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<RefreshCw className="h-4 w-4" />
								)}
								<span className="ml-2">Test Connection</span>
							</Button>
						</div>
					</div>
				</CardHeader>
			</Card>

			{/* Status Toggles */}
			<Card>
				<CardHeader>
					<CardTitle>Status Controls</CardTitle>
					<CardDescription>
						Enable or disable Stripe integration and subscriptions
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Enable Stripe Integration</Label>
							<p className="text-sm text-muted-foreground">
								Master switch for Stripe payment processing
							</p>
						</div>
						<Switch
							checked={settings?.isEnabled || false}
							onCheckedChange={() => toggleEnabledMutation.mutate()}
							disabled={toggleEnabledMutation.isPending}
						/>
					</div>

					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Allow Subscriptions</Label>
							<p className="text-sm text-muted-foreground">
								Users can subscribe to packages when enabled
							</p>
						</div>
						<Switch
							checked={settings?.allowSubscriptions || false}
							onCheckedChange={() => toggleSubscriptionsMutation.mutate()}
							disabled={
								!settings?.isEnabled || toggleSubscriptionsMutation.isPending
							}
						/>
					</div>

					{settings?.isEnabled && !settings?.allowSubscriptions && (
						<div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
							<AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
							<div className="text-sm text-amber-800">
								<p className="font-medium">Subscriptions are disabled</p>
								<p className="mt-1">
									Users will not be able to subscribe to packages even though
									Stripe is enabled.
								</p>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* API Keys Configuration */}
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Shield className="h-5 w-5" />
								API Keys
							</CardTitle>
							<CardDescription>
								Configure your Stripe API keys (all keys are encrypted at rest)
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="publishableKey"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Publishable Key</FormLabel>
										<FormControl>
											<Input
												placeholder="pk_test_..."
												{...field}
												className="font-mono text-sm"
											/>
										</FormControl>
										<FormDescription>
											Your Stripe publishable key (starts with pk_)
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="secretKey"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Secret Key</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={showSecretKey ? "text" : "password"}
													placeholder={
														settings?.secretKeyEncrypted
															? "sk_••••••••••••••••"
															: "sk_test_..."
													}
													{...field}
													className="font-mono text-sm pr-10"
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute right-0 top-0 h-full px-3"
													onClick={() => setShowSecretKey(!showSecretKey)}
												>
													{showSecretKey ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<Eye className="h-4 w-4" />
													)}
												</Button>
											</div>
										</FormControl>
										<FormDescription>
											Your Stripe secret key (starts with sk_) - encrypted in
											database
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="webhookSecret"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Webhook Secret</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={showWebhookSecret ? "text" : "password"}
													placeholder={
														settings?.webhookSecretEncrypted
															? "whsec_••••••••••••••••"
															: "whsec_..."
													}
													{...field}
													className="font-mono text-sm pr-10"
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute right-0 top-0 h-full px-3"
													onClick={() =>
														setShowWebhookSecret(!showWebhookSecret)
													}
												>
													{showWebhookSecret ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<Eye className="h-4 w-4" />
													)}
												</Button>
											</div>
										</FormControl>
										<FormDescription>
											Webhook signing secret for secure event verification
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Subscription Settings */}
					<Card>
						<CardHeader>
							<CardTitle>Subscription Settings</CardTitle>
							<CardDescription>
								Configure default subscription behavior
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="trialPeriodDays"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Default Trial Period (Days)</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
												max="365"
												{...field}
												onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
											/>
										</FormControl>
										<FormDescription>
											Default trial period for new subscriptions (0 for no
											trial)
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="currency"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Default Currency</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select currency" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="usd">USD - US Dollar</SelectItem>
												<SelectItem value="eur">EUR - Euro</SelectItem>
												<SelectItem value="gbp">GBP - British Pound</SelectItem>
												<SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
												<SelectItem value="aud">AUD - Australian Dollar</SelectItem>
												<SelectItem value="jpy">JPY - Japanese Yen</SelectItem>
												<SelectItem value="inr">INR - Indian Rupee</SelectItem>
											</SelectContent>
										</Select>
										<FormDescription>
											Default currency for subscription packages
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Save Button */}
					<div className="flex items-center justify-between">
						<div className="text-sm text-muted-foreground">
							{form.formState.isDirty && (
								<span className="text-amber-600">
									You have unsaved changes
								</span>
							)}
						</div>
						<Button
							type="submit"
							disabled={!form.formState.isDirty || updateMutation.isPending}
						>
							{updateMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Save className="mr-2 h-4 w-4" />
									Save Changes
								</>
							)}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
