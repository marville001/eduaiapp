"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import aiChatApi from "@/lib/api/ai-chat.api";
import { subjectApi, type Subject } from "@/lib/api/subject.api";
import { useUserStore } from "@/stores/user.store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, Brain, FileText, Loader2, MessageSquare, Send, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

export default function AIChatPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const user = useUserStore(state => state.user);

	// Form state
	const [question, setQuestion] = useState("");
	const [selectedSubject, setSelectedSubject] = useState<string>(
		searchParams.get('subject') || ""
	);
	const [files, setFiles] = useState<File[]>([]);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Fetch subjects
	const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
		queryKey: ['subjects'],
		queryFn: () => subjectApi.getAll(undefined, true),
	});

	// Ask question mutation
	const askQuestionMutation = useMutation({
		mutationFn: async (formData: FormData) => {
			return await aiChatApi.askQuestion(formData);
		},
		onSuccess: (data) => {
			// Navigate to the question details page
			router.push(`/app/questions/${data.questionId}`);
		},
		onError: () => {
			const errorMessage = "Failed to submit question. Please try again.";
			setErrors({ submit: errorMessage });
		},
	});

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = Array.from(event.target.files || []);
		const maxSize = 10 * 1024 * 1024; // 10MB
		const allowedTypes = [
			'image/jpeg', 'image/png', 'image/gif', 'image/webp',
			'application/pdf',
			'text/plain',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		];

		const validFiles: File[] = [];
		const fileErrors: string[] = [];

		selectedFiles.forEach(file => {
			if (file.size > maxSize) {
				fileErrors.push(`${file.name} is too large (max 10MB)`);
			} else if (!allowedTypes.includes(file.type)) {
				fileErrors.push(`${file.name} is not a supported file type`);
			} else {
				validFiles.push(file);
			}
		});

		if (fileErrors.length > 0) {
			setErrors({ files: fileErrors.join(', ') });
		} else {
			setErrors({ ...errors, files: '' });
		}

		setFiles(prev => [...prev, ...validFiles]);
	};

	const removeFile = (index: number) => {
		setFiles(prev => prev.filter((_, i) => i !== index));
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const validateForm = () => {
		const formErrors: Record<string, string> = {};

		if (!question.trim()) {
			formErrors.question = "Please enter your question";
		}

		if (!selectedSubject) {
			formErrors.subject = "Please select a subject";
		}

		setErrors(formErrors);
		return Object.keys(formErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		const formData = new FormData();
		formData.append('question', question.trim());
		formData.append('subjectId', selectedSubject);

		// Add files to form data
		files.forEach((file) => {
			formData.append('files', file);
		});

		askQuestionMutation.mutate(formData);
	};

	const getUserGreeting = () => {
		if (!user) return 'Hello';
		const firstName = user.firstName || user.email?.split('@')[0] || 'there';
		return `Hello, ${firstName}`;
	};

	return (
		<div className="max-w-4xl mx-auto space-y-8">
			{/* Header */}
			<div className="text-center space-y-4">
				<div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-purple-600 to-blue-600 rounded-full mb-4">
					<Brain className="h-8 w-8 text-white" />
				</div>
				<h1 className="text-3xl font-bold tracking-tight">
					{getUserGreeting()}! What would you like to learn?
				</h1>
				<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
					Ask any question and our AI will provide detailed, personalized answers to help you learn and understand better.
				</p>
			</div>

			{/* Quick Subject Suggestions */}
			{!selectedSubject && subjects.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Popular Subjects</CardTitle>
						<CardDescription>
							Click on a subject to get started quickly
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{subjects.slice(0, 8).map((subject: Subject) => (
								<Button
									key={subject.id}
									variant="outline"
									size="sm"
									onClick={() => setSelectedSubject(subject.id.toString())}
									className="text-sm"
								>
									{subject.name}
								</Button>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Main Form */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						Ask Your Question
					</CardTitle>
					<CardDescription>
						Be specific with your question for the best answers. You can also upload files for context.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Subject Selection */}
						<div className="space-y-2">
							<label className="text-sm font-medium">
								Subject <span className="text-red-500">*</span>
							</label>
							<Select
								value={selectedSubject}
								onValueChange={setSelectedSubject}
								disabled={subjectsLoading}
							>
								<SelectTrigger>
									<SelectValue placeholder={subjectsLoading ? "Loading subjects..." : "Select a subject"} />
								</SelectTrigger>
								<SelectContent>
									{subjects.map((subject: Subject) => (
										<SelectItem key={subject.id} value={subject.id.toString()}>
											<div>
												<div className="font-medium">{subject.name}</div>
												{subject.description && (
													<div className="text-sm text-muted-foreground">{subject.description}</div>
												)}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.subject && (
								<p className="text-sm text-red-500">{errors.subject}</p>
							)}
						</div>

						{/* Question Input */}
						<div className="space-y-2">
							<label className="text-sm font-medium">
								Your Question <span className="text-red-500">*</span>
							</label>
							<Textarea
								value={question}
								onChange={(e) => setQuestion(e.target.value)}
								placeholder="Ask anything you'd like to learn about... Be as detailed as possible for better answers."
								rows={6}
								className="resize-none"
								disabled={askQuestionMutation.isPending}
							/>
							<div className="flex justify-between items-center text-sm text-muted-foreground">
								<span>Be specific and clear with your question</span>
								<span>{question.length}/2000</span>
							</div>
							{errors.question && (
								<p className="text-sm text-red-500">{errors.question}</p>
							)}
						</div>

						{/* File Upload */}
						<div className="space-y-2">
							<label className="text-sm font-medium">
								Attach Files (Optional)
							</label>
							<div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
								<input
									ref={fileInputRef}
									type="file"
									multiple
									accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.doc,.docx"
									onChange={handleFileUpload}
									className="hidden"
									disabled={askQuestionMutation.isPending}
								/>
								<div className="space-y-2">
									<Upload className="h-8 w-8 text-gray-400 mx-auto" />
									<div>
										<button
											type="button"
											onClick={() => fileInputRef.current?.click()}
											className="text-purple-600 hover:text-purple-700 font-medium"
											disabled={askQuestionMutation.isPending}
										>
											Click to upload files
										</button>
										<p className="text-sm text-gray-500">or drag and drop</p>
									</div>
									<p className="text-xs text-gray-400">
										PNG, JPG, GIF, WebP, PDF, TXT, DOC, DOCX up to 10MB each
									</p>
								</div>
							</div>

							{/* Uploaded Files */}
							{files.length > 0 && (
								<div className="space-y-2">
									<p className="text-sm font-medium">Uploaded Files:</p>
									<div className="space-y-2">
										{files.map((file, index) => (
											<div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
												<FileText className="h-4 w-4 text-gray-500" />
												<div className="flex-1">
													<p className="text-sm font-medium">{file.name}</p>
													<p className="text-xs text-gray-500">
														{(file.size / 1024 / 1024).toFixed(2)} MB
													</p>
												</div>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => removeFile(index)}
													disabled={askQuestionMutation.isPending}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										))}
									</div>
								</div>
							)}

							{errors.files && (
								<p className="text-sm text-red-500">{errors.files}</p>
							)}
						</div>

						{/* Submit Error */}
						{errors.submit && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									{errors.submit}
								</AlertDescription>
							</Alert>
						)}

						{/* Submit Button */}
						<div className="flex gap-3 pt-4">
							<Button
								type="submit"
								disabled={askQuestionMutation.isPending || !question.trim() || !selectedSubject}
								className="flex-1 sm:flex-none"
							>
								{askQuestionMutation.isPending ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Submitting...
									</>
								) : (
									<>
										<Send className="h-4 w-4 mr-2" />
										Ask AI
									</>
								)}
							</Button>

							<Button type="button" variant="outline" asChild>
								<Link href="/app/questions">
									View History
								</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Tips Section */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Tips for Better Answers</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
						<div className="space-y-2">
							<div className="flex items-start gap-2">
								<div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0"></div>
								<div>
									<p className="font-medium">Be Specific</p>
									<p className="text-muted-foreground">Ask detailed questions rather than general ones</p>
								</div>
							</div>
							<div className="flex items-start gap-2">
								<div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
								<div>
									<p className="font-medium">Provide Context</p>
									<p className="text-muted-foreground">Include relevant background information</p>
								</div>
							</div>
						</div>
						<div className="space-y-2">
							<div className="flex items-start gap-2">
								<div className="w-2 h-2 bg-purple-500 rounded-full mt-2 shrink-0"></div>
								<div>
									<p className="font-medium">Use Files</p>
									<p className="text-muted-foreground">Upload documents or images for better context</p>
								</div>
							</div>
							<div className="flex items-start gap-2">
								<div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0"></div>
								<div>
									<p className="font-medium">Choose Right Subject</p>
									<p className="text-muted-foreground">Select the most relevant subject area</p>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}