"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import aiChatApi from "@/lib/api/ai-chat.api";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, ArrowLeft, Brain, Calendar, CheckCircle, Clock, Copy, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const statusColors = {
	pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
	answered: "bg-green-100 text-green-800 border-green-200",
	failed: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels = {
	pending: "Processing",
	answered: "Answered",
	failed: "Failed",
};

export default function QuestionDetailPage() {
	const params = useParams();
	const router = useRouter();
	const questionId = params.questionId as string;

	const [copied, setCopied] = useState<string | null>(null);

	// Fetch question details
	const { data: question, isLoading, error } = useQuery({
		queryKey: ['question', questionId],
		queryFn: () => aiChatApi.getQuestion(questionId),
		enabled: !!questionId,
	});

	const copyToClipboard = async (text: string, type: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(type);
			setTimeout(() => setCopied(null), 2000);
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="animate-pulse">
					<div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
					<div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
				</div>

				<Card className="animate-pulse">
					<CardHeader>
						<div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
						<div className="h-6 bg-gray-200 rounded w-3/4"></div>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div className="h-4 bg-gray-200 rounded"></div>
							<div className="h-4 bg-gray-200 rounded w-5/6"></div>
							<div className="h-4 bg-gray-200 rounded w-4/6"></div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error || !question) {
		return (
			<div className="flex items-center justify-center h-96">
				<Card className="max-w-md">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-red-600">
							<AlertCircle className="h-5 w-5" />
							Question Not Found
						</CardTitle>
						<CardDescription>
							The question you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Button onClick={() => router.back()} variant="outline" className="w-full">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Go Back
						</Button>
						<Button asChild className="w-full">
							<Link href="/app/questions">
								View All Questions
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" onClick={() => router.back()}>
					<ArrowLeft className="h-4 w-4 mr-1" />
					Back
				</Button>
				<div className="h-5 w-px bg-border"></div>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Question Details</h1>
					<p className="text-muted-foreground">
						Asked on {format(new Date(question.createdAt), "MMMM d, yyyy 'at' h:mm a")}
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-6">
					{/* Question Card */}
					<Card>
						<CardHeader>
							<div className="flex items-start justify-between gap-4">
								<div>
									<CardTitle className="flex items-center gap-2">
										<MessageSquare className="h-5 w-5" />
										Your Question
									</CardTitle>
									<CardDescription>
										Subject: {question.subject?.name}
									</CardDescription>
								</div>
								<div className="flex items-center gap-2">
									<Badge className={statusColors[question.status]}>
										{statusLabels[question.status]}
									</Badge>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => copyToClipboard(question.question, 'question')}
									>
										{copied === 'question' ? (
											<CheckCircle className="h-4 w-4 text-green-600" />
										) : (
											<Copy className="h-4 w-4" />
										)}
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="bg-gray-50 rounded-lg p-4">
								<p className="text-gray-900 whitespace-pre-wrap">{question.question}</p>
							</div>
						</CardContent>
					</Card>

					{/* Answer Card */}
					{question.status === 'answered' && question.answer && (
						<Card>
							<CardHeader>
								<div className="flex items-start justify-between gap-4">
									<div>
										<CardTitle className="flex items-center gap-2 text-green-600">
											<Brain className="h-5 w-5" />
											AI Answer
										</CardTitle>
										<CardDescription>
											Generated response from our AI system
										</CardDescription>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => copyToClipboard(question.answer || '', 'answer')}
									>
										{copied === 'answer' ? (
											<CheckCircle className="h-4 w-4 text-green-600" />
										) : (
											<Copy className="h-4 w-4" />
										)}
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								<div className="bg-green-50 rounded-lg p-4 border border-green-100">
									<p className="text-green-900 whitespace-pre-wrap">{question.answer}</p>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Processing Status */}
					{question.status === 'pending' && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-yellow-600">
									<Clock className="h-5 w-5" />
									Processing Your Question
								</CardTitle>
								<CardDescription>
									Our AI is working on your question. This usually takes a few moments.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
									<div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-500 border-t-transparent"></div>
									<span className="text-yellow-800">Processing question...</span>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Failed Status */}
					{question.status === 'failed' && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-red-600">
									<AlertCircle className="h-5 w-5" />
									Processing Failed
								</CardTitle>
								<CardDescription>
									There was an issue processing your question.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="p-4 bg-red-50 rounded-lg border border-red-200">
										<p className="text-red-800">
											Your question could not be processed at this time. This might be due to:
										</p>
										<ul className="list-disc list-inside mt-2 text-red-700 space-y-1">
											<li>The question was too complex or unclear</li>
											<li>Technical issues with our AI system</li>
											<li>Content that doesn&apos;t fit our guidelines</li>
										</ul>
									</div>
									<Button asChild>
										<Link href="/app/chat">
											<MessageSquare className="h-4 w-4 mr-2" />
											Ask Another Question
										</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Follow-up Questions */}
					{question.status === 'answered' && (
						<Card>
							<CardHeader>
								<CardTitle>Ask a Follow-up Question</CardTitle>
								<CardDescription>
									Have more questions about this topic? Ask AI for more details.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<Textarea
									placeholder="Ask a follow-up question about this topic..."
									rows={4}
								/>
								<div className="flex gap-3">
									<Button>
										<Brain className="h-4 w-4 mr-2" />
										Ask Follow-up
									</Button>
									<Button variant="outline" asChild>
										<Link href="/app/chat">
											Ask New Question
										</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Question Metadata */}
					<Card>
						<CardHeader>
							<CardTitle>Question Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-start gap-3">
								<Calendar className="h-4 w-4 text-muted-foreground mt-1" />
								<div>
									<p className="font-medium">Asked</p>
									<p className="text-sm text-muted-foreground">
										{format(new Date(question.createdAt), "PPP 'at' p")}
									</p>
								</div>
							</div>

							{question.processingTimeMs && (
								<>
									<Separator />
									<div className="flex items-start gap-3">
										<Clock className="h-4 w-4 text-muted-foreground mt-1" />
										<div>
											<p className="font-medium">Processing Time</p>
											<p className="text-sm text-muted-foreground">
												{(question.processingTimeMs / 1000).toFixed(2)} seconds
											</p>
										</div>
									</div>
								</>
							)}

							<Separator />
							<div className="flex items-start gap-3">
								<MessageSquare className="h-4 w-4 text-muted-foreground mt-1" />
								<div>
									<p className="font-medium">Subject</p>
									<p className="text-sm text-muted-foreground">{question.subject?.name}</p>
									{question.subject?.description && (
										<p className="text-xs text-muted-foreground mt-1">
											{question.subject.description}
										</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Quick Actions */}
					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button asChild variant="outline" className="w-full justify-start">
								<Link href="/app/questions">
									<ArrowLeft className="h-4 w-4 mr-2" />
									All Questions
								</Link>
							</Button>
							<Button asChild className="w-full justify-start">
								<Link href={`/app/chat?subject=${question.subject?.id}`}>
									<Brain className="h-4 w-4 mr-2" />
									Ask Another Question
								</Link>
							</Button>
							{question.status === 'answered' && (
								<Button
									variant="outline"
									className="w-full justify-start"
									onClick={() => copyToClipboard(question.answer || '', 'answer')}
								>
									{copied === 'answer' ? (
										<CheckCircle className="h-4 w-4 mr-2 text-green-600" />
									) : (
										<Copy className="h-4 w-4 mr-2" />
									)}
									Copy Answer
								</Button>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}