"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, Eye, Brain, Globe, Tag, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { subjectApi, Subject } from "@/lib/api/subject.api";
import ApiStatus from "../components/api-status";
import SubjectDetailsForm from "./components/subject-details-form";
import SubjectAIPromptForm from "./components/subject-ai-prompt-form";
import SubjectSEOForm from "./components/subject-seo-form";

export default function SubjectViewPage() {
	const [activeTab, setActiveTab] = useState("details");
	const [isEditing, setIsEditing] = useState(false);
	const router = useRouter();
	const queryClient = useQueryClient();

	const params = useParams<{ id: string; }>();

	// Fetch subject details
	const { data: subject, isLoading, error } = useQuery({
		queryKey: ['subject', params.id],
		queryFn: () => subjectApi.getById(params.id),
	});

	// Update subject mutation
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<Subject>; }) =>
			subjectApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['subject', params.id] });
			queryClient.invalidateQueries({ queryKey: ['subjects'] });
			toast.success('Subject updated successfully');
			setIsEditing(false);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to update subject');
		},
	});

	const handleSave = (data: Partial<Subject>) => {
		updateMutation.mutate({
			id: params.id,
			data,
		});
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center space-x-4">
					<Button variant="outline" size="sm" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
						<div className="h-4 bg-gray-200 rounded w-32"></div>
					</div>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 space-y-6">
						{Array.from({ length: 3 }).map((_, i) => (
							<Card key={i} className="animate-pulse">
								<CardContent className="p-6">
									<div className="space-y-4">
										<div className="h-4 bg-gray-200 rounded w-3/4"></div>
										<div className="h-4 bg-gray-200 rounded w-1/2"></div>
										<div className="h-20 bg-gray-200 rounded"></div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error || !subject) {
		return (
			<div className="space-y-6">
				<div className="flex items-center space-x-4">
					<Button variant="outline" size="sm" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Subject Not Found</h1>
					</div>
				</div>
				<ApiStatus error={error} onRetry={() => window.location.reload()} />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Button variant="outline" size="sm" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
					<div>
						<div className="flex items-center space-x-3 mb-2">
							<h1 className="text-3xl font-bold text-gray-900">{subject.name}</h1>
							<Badge
								variant={subject.isActive ? "default" : "secondary"}
								className={subject.isActive ? "bg-green-100 text-green-800" : ""}
							>
								{subject.isActive ? 'Active' : 'Inactive'}
							</Badge>
						</div>
						<p className="text-gray-600">
							Manage subject details, AI prompts, and SEO settings
						</p>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						onClick={() => setIsEditing(!isEditing)}
					>
						{isEditing ? (
							<>
								<Eye className="h-4 w-4 mr-2" />
								View Mode
							</>
						) : (
							<>
								<Edit className="h-4 w-4 mr-2" />
								Edit Mode
							</>
						)}
					</Button>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Globe className="h-5 w-5 text-blue-600" />
							<div>
								<p className="text-sm font-medium text-gray-600">Slug</p>
								<p className="text-sm text-gray-900">{subject.slug}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Brain className="h-5 w-5 text-purple-600" />
							<div>
								<p className="text-sm font-medium text-gray-600">AI Prompt</p>
								<p className="text-sm text-gray-900">
									{subject.aiPrompt ? 'Configured' : 'Not Set'}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Tag className="h-5 w-5 text-green-600" />
							<div>
								<p className="text-sm font-medium text-gray-600">SEO Tags</p>
								<p className="text-sm text-gray-900">
									{subject.seoTags?.length || 0} tags
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<ImageIcon className="h-5 w-5 text-orange-600" />
							<div>
								<p className="text-sm font-medium text-gray-600">SEO Image</p>
								<p className="text-sm text-gray-900">
									{subject.seoImage ? 'Set' : 'Not Set'}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Content Tabs */}
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<div className="lg:col-span-3">
					<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="details">
								<Edit className="h-4 w-4 mr-2" />
								Subject Details
							</TabsTrigger>
							<TabsTrigger value="ai-prompt">
								<Brain className="h-4 w-4 mr-2" />
								AI Prompt
							</TabsTrigger>
							<TabsTrigger value="seo">
								<Globe className="h-4 w-4 mr-2" />
								SEO Settings
							</TabsTrigger>
						</TabsList>

						<TabsContent value="details">
							<Card>
								<CardHeader>
									<CardTitle>Subject Information</CardTitle>
								</CardHeader>
								<CardContent>
									<SubjectDetailsForm
										subject={subject}
										isEditing={isEditing}
										onSave={handleSave}
										isLoading={updateMutation.isPending}
									/>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="ai-prompt">
							<Card>
								<CardHeader>
									<CardTitle>AI Tutoring Prompt</CardTitle>
								</CardHeader>
								<CardContent>
									<SubjectAIPromptForm
										subject={subject}
										isEditing={isEditing}
										onSave={handleSave}
										isLoading={updateMutation.isPending}
									/>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="seo">
							<Card>
								<CardHeader>
									<CardTitle>SEO & Metadata</CardTitle>
								</CardHeader>
								<CardContent>
									<SubjectSEOForm
										subject={subject}
										isEditing={isEditing}
										onSave={handleSave}
										isLoading={updateMutation.isPending}
									/>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Subject Info</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<p className="text-sm font-medium text-gray-600">Created</p>
								<p className="text-sm text-gray-900">
									{new Date(subject.createdAt).toLocaleDateString()}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-600">Last Updated</p>
								<p className="text-sm text-gray-900">
									{new Date(subject.updatedAt).toLocaleDateString()}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-600">Subject ID</p>
								<p className="text-xs text-gray-500 font-mono">{subject.subjectId}</p>
							</div>
						</CardContent>
					</Card>

					{/* Actions */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button
								variant="outline"
								className="w-full justify-start"
								onClick={() => {
									// TODO: Navigate to public subject page
									toast.info('Public view not implemented yet');
								}}
							>
								<Eye className="h-4 w-4 mr-2" />
								View Public Page
							</Button>
							<Button
								variant="outline"
								className="w-full justify-start"
								onClick={() => {
									// TODO: Implement duplicate functionality
									toast.info('Duplicate feature coming soon');
								}}
							>
								<Edit className="h-4 w-4 mr-2" />
								Duplicate Subject
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}