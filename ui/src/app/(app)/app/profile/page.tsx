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
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { userApi } from "@/lib/api/user.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, Phone, User as UserIcon } from "lucide-react";
import { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Profile form schema
const profileFormSchema = z.object({
	firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
	lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
	email: z.string().email("Invalid email address"),
	phone: z.string().optional(),
});

// Password form schema
const passwordFormSchema = z.object({
	currentPassword: z.string().min(1, "Current password is required"),
	newPassword: z.string().min(6, "New password must be at least 6 characters"),
	confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
	message: "Passwords don't match",
	path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileFormSchema>;
type PasswordFormData = z.infer<typeof passwordFormSchema>;

export default function ProfilePage() {
	const { user, fetchUserData } = useAuth();
	const queryClient = useQueryClient();

	// Profile form
	const profileForm = useForm<ProfileFormData>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: {
			firstName: user?.firstName || "",
			lastName: user?.lastName || "",
			email: user?.email || "",
			phone: user?.phone || "",
		},
	});
	useEffect(() => {
		if (user) {
			profileForm.reset({
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				email: user.email || "",
				phone: user.phone || "",
			});
		}
	}, [user]); // eslint-disable-line react-hooks/exhaustive-deps

	// Password form
	const passwordForm = useForm<PasswordFormData>({
		resolver: zodResolver(passwordFormSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	// Update profile mutation
	const updateProfileMutation = useMutation({
		mutationFn: (data: ProfileFormData) => userApi.updateProfile(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["current-user"] });
			toast.success("Profile updated successfully");
			fetchUserData();
		},
		onError: (error: Error) => {
			toast.error("Failed to update profile", {
				description: error.message,
			});
		},
	});

	// Change password mutation
	const changePasswordMutation = useMutation({
		mutationFn: (data: { currentPassword: string; newPassword: string; }) =>
			userApi.changePassword(data),
		onSuccess: () => {
			toast.success("Password changed successfully");
			passwordForm.reset();
		},
		onError: (error: Error) => {
			toast.error("Failed to change password", {
				description: error.message,
			});
		},
	});

	const onProfileSubmit = (data: ProfileFormData) => {
		updateProfileMutation.mutate(data);
	};

	const onPasswordSubmit = (data: PasswordFormData) => {
		changePasswordMutation.mutate({
			currentPassword: data.currentPassword,
			newPassword: data.newPassword,
		});
	};

	if (!user) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="container mx-auto py-6 space-y-6 max-w-4xl">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
				<p className="text-gray-600 mt-2">
					Manage your account settings and preferences
				</p>
			</div>

			{/* User Info Card */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-4">
						<div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
							<UserIcon className="h-8 w-8 text-white" />
						</div>
						<div>
							<CardTitle className="text-2xl">
								{user.firstName} {user.lastName}
							</CardTitle>
							<CardDescription className="flex items-center gap-2 mt-1">
								<Mail className="h-4 w-4" />
								{user.email}
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				{user.phone && (
					<CardContent>
						<div className="flex flex-wrap gap-4 text-sm">
							<div className="flex items-center gap-2">
								<Phone className="h-4 w-4 text-muted-foreground" />
								<span className="text-muted-foreground">Phone:</span>
								<span className="font-medium">{user.phone}</span>
							</div>
						</div>
					</CardContent>
				)}
			</Card>

			{/* Settings Tabs */}
			<Tabs defaultValue="profile" className="space-y-6">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="profile">Profile Information</TabsTrigger>
					<TabsTrigger value="password">Change Password</TabsTrigger>
				</TabsList>

				{/* Profile Tab */}
				<TabsContent value="profile">
					<Card>
						<CardHeader>
							<CardTitle>Profile Information</CardTitle>
							<CardDescription>
								Update your personal information and contact details
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Form {...profileForm}>
								<form
									onSubmit={profileForm.handleSubmit(onProfileSubmit)}
									className="space-y-6"
								>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<FormField
											control={profileForm.control}
											name="firstName"
											render={({ field }) => (
												<FormItem>
													<FormLabel>First Name *</FormLabel>
													<FormControl>
														<Input placeholder="John" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={profileForm.control}
											name="lastName"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Last Name *</FormLabel>
													<FormControl>
														<Input placeholder="Doe" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={profileForm.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email Address *</FormLabel>
												<FormControl>
													<Input
														disabled
														readOnly
														className='cursor-not-allowed'
														type="email"
														placeholder="john.doe@example.com"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={profileForm.control}
										name="phone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Phone Number</FormLabel>
												<FormControl>
													<Input
														type="tel"
														placeholder="+1234567890"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<Separator />

									<div className="flex justify-end">
										<Button
											type="submit"
											disabled={updateProfileMutation.isPending}
										>
											{updateProfileMutation.isPending ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Saving...
												</>
											) : (
												"Save Changes"
											)}
										</Button>
									</div>
								</form>
							</Form>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Password Tab */}
				<TabsContent value="password">
					<Card>
						<CardHeader>
							<CardTitle>Change Password</CardTitle>
							<CardDescription>
								Update your password to keep your account secure
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Form {...passwordForm}>
								<form
									onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
									className="space-y-6"
								>
									<FormField
										control={passwordForm.control}
										name="currentPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Current Password *</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="Enter your current password"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={passwordForm.control}
										name="newPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel>New Password *</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="Enter your new password"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={passwordForm.control}
										name="confirmPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Confirm New Password *</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="Confirm your new password"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="flex justify-end">
										<Button
											type="submit"
											disabled={changePasswordMutation.isPending}
										>
											{changePasswordMutation.isPending ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Changing...
												</>
											) : (
												"Change Password"
											)}
										</Button>
									</div>
								</form>
							</Form>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
