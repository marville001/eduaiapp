"use client";

import { TiptapEditor } from '@/components/tiptap/editor/tiptap-editor';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Subject } from "@/lib/api/subject.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Brain, Copy, FunctionSquare, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
	aiPrompt: z.string().optional(),
	useLatex: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface SubjectAIPromptFormProps {
	subject: Subject;
	isEditing: boolean;
	onSave: (data: Partial<Subject>) => void;
	isLoading: boolean;
}

export default function SubjectAIPromptForm({
	subject,
	isEditing,
	onSave,
	isLoading,
}: SubjectAIPromptFormProps) {
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			aiPrompt: subject.aiPrompt || "",
			useLatex: subject.useLatex || false,
		},
	});

	const handleSubmit = (data: FormData) => {
		onSave({
			aiPrompt: data.aiPrompt,
			useLatex: data.useLatex,
		});
		setHasUnsavedChanges(false);
	};

	const handleFieldChange = () => {
		setHasUnsavedChanges(true);
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast.success('Copied to clipboard');
		} catch {
			toast.error('Failed to copy');
		}
	};

	if (!isEditing) {
		return (
			<div className="space-y-6">
				{/* LaTeX Status */}
				<div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50">
					<div className="flex items-center space-x-3">
						<FunctionSquare className="h-5 w-5 text-primary" />
						<div>
							<h3 className="text-sm font-medium">LaTeX Formatting</h3>
							<p className="text-xs text-gray-500">
								Format mathematical expressions in responses
							</p>
						</div>
					</div>
					<Badge variant={subject.useLatex ? "default" : "secondary"}>
						{subject.useLatex ? "Enabled" : "Disabled"}
					</Badge>
				</div>

				<div className="flex items-center space-x-3 mb-4">
					<Brain className="h-5 w-5 text-primary" />
					<h3 className="text-lg font-medium">Current AI Prompt</h3>
					{subject.aiPrompt && (
						<Badge variant="secondary">Configured</Badge>
					)}
				</div>

				{subject.aiPrompt ? (
					<div className="space-y-4">
						<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
							{/* <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono"> */}

							<article
								className='prose prose-sm'
								dangerouslySetInnerHTML={{
									__html: subject.aiPrompt || "<p></p>"
								}}
							/>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => copyToClipboard(subject.aiPrompt!)}
						>
							<Copy className="h-4 w-4 mr-2" />
							Copy Prompt
						</Button>
					</div>
				) : (
					<div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
						<Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<p className="text-gray-600">No AI prompt configured</p>
						<p className="text-sm text-gray-500 mt-1">
							Set up a custom prompt to enhance AI tutoring for this subject
						</p>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Custom Prompt Form */}
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					{/* LaTeX Toggle */}
					<FormField
						control={form.control}
						name="useLatex"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-linear-to-r from-purple-50 to-blue-50">
								<div className="space-y-0.5">
									<div className="flex items-center space-x-2">
										<FunctionSquare className="h-5 w-5 text-purple-600" />
										<FormLabel className="text-base font-medium">LaTeX Formatting</FormLabel>
									</div>
									<FormDescription className="text-sm text-gray-600">
										Enable LaTeX formatting for mathematical expressions in AI responses.
										When enabled, the AI will format equations using LaTeX notation ($...$ for inline, $$...$$ for blocks).
									</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={(checked: boolean) => {
											field.onChange(checked);
											handleFieldChange();
										}}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="aiPrompt"
						render={({ field }) => (
							<FormItem>
								<FormLabel>AI Tutoring Prompt</FormLabel>
								<FormControl>
									<TiptapEditor
										value={field.value || ""}
										onChange={(value) => {
											field.onChange(value.html);
											handleFieldChange();
										}}
										showToolbar
									/>
								</FormControl>
								<FormDescription>
									This prompt will guide the AI when helping students with {subject.name} questions.
									Be specific about teaching style, approach, and any subject-specific considerations.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Prompt Actions */}
					<div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<div className="flex items-center space-x-2">
							<Brain className="h-4 w-4 text-blue-600" />
							<span className="text-sm text-blue-800">
								Character count: {form.getValues('aiPrompt')?.length || 0}
							</span>
						</div>
						<div className="flex space-x-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => {
									form.setValue('aiPrompt', '');
									handleFieldChange();
								}}
							>
								<RotateCcw className="h-4 w-4 mr-2" />
								Clear
							</Button>
							{form.getValues('aiPrompt') && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => copyToClipboard(form.getValues('aiPrompt') || '')}
								>
									<Copy className="h-4 w-4 mr-2" />
									Copy
								</Button>
							)}
						</div>
					</div>

					{hasUnsavedChanges && (
						<div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
							<p className="text-sm text-yellow-800">
								You have unsaved changes to the AI settings
							</p>
							<div className="flex space-x-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => {
										form.reset();
										setHasUnsavedChanges(false);
									}}
								>
									Discard
								</Button>
								<Button type="submit" size="sm" disabled={isLoading}>
									{isLoading ? "Saving..." : "Save Settings"}
								</Button>
							</div>
						</div>
					)}
				</form>
			</Form>
		</div>
	);
}