"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import aiChatApi from "@/lib/api/ai-chat.api";
import { subjectApi, type Subject } from "@/lib/api/subject.api";
import type { Question } from "@/types/ai-chat";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, Calendar, ChevronRight, Clock, Eye, Filter, MessageSquare, Search } from "lucide-react";
import Link from "next/link";
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

const statusIcons = {
	pending: Clock,
	answered: MessageSquare,
	failed: AlertCircle,
};

export default function QuestionsHistoryPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [subjectFilter, setSubjectFilter] = useState<string>("all");

	// Fetch user questions
	const { data: questions = [], isLoading, error } = useQuery({
		queryKey: ['user-questions'],
		queryFn: () => aiChatApi.getUserQuestions(),
	});

	// Fetch subjects for filter
	const { data: subjects = [] } = useQuery({
		queryKey: ['subjects'],
		queryFn: () => subjectApi.getAll(undefined, true),
	});

	// Filter questions based on search and filters
	const filteredQuestions = questions.filter((question: Question) => {
		const matchesSearch = question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
			question.answer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			question.subject?.name.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus = statusFilter === "all" || question.status === statusFilter;
		const matchesSubject = subjectFilter === "all" || question.subject?.id.toString() === subjectFilter;

		return matchesSearch && matchesStatus && matchesSubject;
	});

	// Group questions by date
	const groupedQuestions = filteredQuestions.reduce((groups: Record<string, Question[]>, question: Question) => {
		const date = format(new Date(question.createdAt), 'yyyy-MM-dd');
		if (!groups[date]) {
			groups[date] = [];
		}
		groups[date].push(question);
		return groups;
	}, {});

	// Sort dates descending
	const sortedDates = Object.keys(groupedQuestions).sort((a, b) => b.localeCompare(a));

	const clearFilters = () => {
		setSearchQuery("");
		setStatusFilter("all");
		setSubjectFilter("all");
	};

	const hasActiveFilters = searchQuery || statusFilter !== "all" || subjectFilter !== "all";

	if (error) {
		return (
			<div className="flex items-center justify-center h-96">
				<Card className="max-w-md w-full">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-red-600">
							<AlertCircle className="h-5 w-5" />
							Error Loading Questions
						</CardTitle>
						<CardDescription>
							There was an error loading your questions. Please try again later.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							onClick={() => window.location.reload()}
							className="w-full"
						>
							Retry
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Questions History</h1>
					<p className="text-muted-foreground">
						View and manage all your AI questions and answers
					</p>
				</div>
				<Button asChild>
					<Link href="/app/chat">
						<MessageSquare className="h-4 w-4 mr-2" />
						Ask New Question
					</Link>
				</Button>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Filter Questions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						{/* Search */}
						<div className="relative">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search questions..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9"
							/>
						</div>

						{/* Status Filter */}
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger>
								<SelectValue placeholder="All Statuses" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="answered">Answered</SelectItem>
								<SelectItem value="pending">Processing</SelectItem>
								<SelectItem value="failed">Failed</SelectItem>
							</SelectContent>
						</Select>

						{/* Subject Filter */}
						<Select value={subjectFilter} onValueChange={setSubjectFilter}>
							<SelectTrigger>
								<SelectValue placeholder="All Subjects" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Subjects</SelectItem>
								{subjects.map((subject: Subject) => (
									<SelectItem key={subject.id} value={subject.id.toString()}>
										{subject.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Clear Filters */}
						{hasActiveFilters && (
							<Button variant="outline" onClick={clearFilters}>
								Clear Filters
							</Button>
						)}
					</div>

					{/* Results count */}
					<div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
						<Filter className="h-4 w-4" />
						<span>
							Showing {filteredQuestions.length} of {questions.length} questions
							{hasActiveFilters && " (filtered)"}
						</span>
					</div>
				</CardContent>
			</Card>

			{/* Questions List */}
			{isLoading ? (
				<div className="space-y-6">
					{[...Array(3)].map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardHeader>
								<div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
								<div className="space-y-2">
									<div className="h-4 bg-gray-200 rounded w-3/4"></div>
									<div className="h-4 bg-gray-200 rounded w-1/2"></div>
								</div>
							</CardHeader>
						</Card>
					))}
				</div>
			) : filteredQuestions.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-16">
						{hasActiveFilters ? (
							<>
								<Search className="h-16 w-16 text-gray-400 mb-4" />
								<h3 className="text-xl font-semibold text-gray-900 mb-2">No questions found</h3>
								<p className="text-gray-500 mb-4 text-center max-w-sm">
									No questions match your current filters. Try adjusting your search criteria.
								</p>
								<Button onClick={clearFilters} variant="outline">
									Clear Filters
								</Button>
							</>
						) : (
							<>
								<MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
								<h3 className="text-xl font-semibold text-gray-900 mb-2">No questions yet</h3>
								<p className="text-gray-500 mb-4 text-center max-w-sm">
									You haven&apos;t asked any questions yet. Start your learning journey by asking AI a question!
								</p>
								<Button asChild>
									<Link href="/ai-tutor">
										<MessageSquare className="h-4 w-4 mr-2" />
										Ask Your First Question
									</Link>
								</Button>
							</>
						)}
					</CardContent>
				</Card>
			) : (
				<div className="space-y-8">
					{sortedDates.map((date) => (
						<div key={date} className="space-y-4">
							{/* Date Header */}
							<div className="flex items-center gap-3">
								<Calendar className="h-5 w-5 text-muted-foreground" />
								<h3 className="font-semibold text-lg">
									{format(new Date(date), 'EEEE, MMMM d, yyyy')}
								</h3>
								<div className="h-px bg-border flex-1"></div>
								<Badge variant="secondary">
									{groupedQuestions[date].length} questions
								</Badge>
							</div>

							{/* Questions for this date */}
							<div className="space-y-4">
								{groupedQuestions[date].map((question: Question) => {
									const StatusIcon = statusIcons[question.status];

									return (
										<Card key={question.questionId} className="transition-all hover:shadow-md">
											<CardContent className="p-6">
												<div className="flex items-start gap-4">
													{/* Status Icon */}
													<div className={`p-2 rounded-full ${statusColors[question.status]} shrink-0`}>
														<StatusIcon className="h-4 w-4" />
													</div>

													{/* Content */}
													<div className="flex-1 space-y-3">
														{/* Question Header */}
														<div className="flex items-start justify-between gap-4">
															<div className="flex-1">
																<div className="flex items-center gap-2 mb-2">
																	<Badge className={statusColors[question.status]}>
																		{statusLabels[question.status]}
																	</Badge>
																	<span className="text-sm text-muted-foreground">
																		{question.subject?.name}
																	</span>
																	<span className="text-sm text-muted-foreground">•</span>
																	<span className="text-sm text-muted-foreground">
																		{format(new Date(question.createdAt), 'h:mm a')}
																	</span>
																	{question.processingTimeMs && (
																		<>
																			<span className="text-sm text-muted-foreground">•</span>
																			<span className="text-sm text-muted-foreground">
																				{(question.processingTimeMs / 1000).toFixed(1)}s
																			</span>
																		</>
																	)}
																</div>
																<h4 className="font-medium text-gray-900 line-clamp-2">
																	{question.question}
																</h4>
															</div>
															<Button variant="ghost" size="sm" asChild>
																<Link href={`/app/questions/${question.questionId}`}>
																	<Eye className="h-4 w-4 mr-1" />
																	View
																	<ChevronRight className="h-3 w-3 ml-1" />
																</Link>
															</Button>
														</div>

														{/* Answer Preview */}
														{question.status === 'answered' && question.answer && (
															<div className="bg-green-50 rounded-lg p-4 border border-green-100">
																<div className="flex items-start gap-3">
																	<div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
																		<MessageSquare className="h-3 w-3 text-white" />
																	</div>
																	<div className="flex-1">
																		<p className="text-sm text-green-800 line-clamp-3">
																			{question.answer}
																		</p>
																	</div>
																</div>
															</div>
														)}

													</div>
												</div>
											</CardContent>
										</Card>
									);
								})}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}