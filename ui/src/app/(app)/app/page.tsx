"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import aiChatApi from "@/lib/api/ai-chat.api";
import { subjectApi, type Subject } from "@/lib/api/subject.api";
import { useUserStore } from "@/stores/user.store";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { BookOpen, Brain, ChevronRight, Clock, Eye, MessageSquare, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";

const statusColors = {
	pending: "bg-yellow-100 text-yellow-800",
	answered: "bg-green-100 text-green-800",
	failed: "bg-red-100 text-red-800",
};

const statusLabels = {
	pending: "Processing",
	answered: "Answered",
	failed: "Failed",
};

export default function UserDashboard() {
	const user = useUserStore(state => state.user);

	// Fetch user's questions
	const { data: userQuestions, isLoading: questionsLoading } = useQuery({
		queryKey: ['user-questions'],
		queryFn: () => aiChatApi.getUserQuestions(),
	});

	// Fetch question stats
	const { data: questionStats, isLoading: statsLoading } = useQuery({
		queryKey: ['user-question-stats'],
		queryFn: () => aiChatApi.getQuestionStats(),
	});

	// Fetch subjects
	const { data: subjects, isLoading: subjectsLoading } = useQuery({
		queryKey: ['subjects'],
		queryFn: () => subjectApi.getAll(undefined, true), // Get all active subjects
	});

	// Recent questions (last 5)
	const recentQuestions = userQuestions?.slice(0, 5) || [];

	// Popular subjects (first 6)
	const popularSubjects = subjects?.slice(0, 6) || [];

	const getUserGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 18) return "Good afternoon";
		return "Good evening";
	};

	const getUserName = () => {
		if (!user) return 'Student';
		return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Student';
	};

	return (
		<div className="space-y-8">
			{/* Welcome Section */}
			<div className="bg-linear-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold mb-2">
							{getUserGreeting()}, {getUserName()}! 👋
						</h2>
						<p className="text-purple-100 mb-4">
							Ready to learn something new today? Ask AI any question or explore subjects.
						</p>
						<Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-50">
							<Link href="/app/chat">
								<Brain className="h-5 w-5 mr-2" />
								Ask AI Question
							</Link>
						</Button>
					</div>
					<div className="hidden md:block">
						<div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
							<Brain className="h-12 w-12 text-white" />
						</div>
					</div>
				</div>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Questions</CardTitle>
						<MessageSquare className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{statsLoading ? "..." : questionStats?.total || 0}
						</div>
						<p className="text-xs text-muted-foreground">
							Questions asked so far
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Answered</CardTitle>
						<div className="h-4 w-4 rounded-full bg-green-500"></div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{statsLoading ? "..." : questionStats?.answered || 0}
						</div>
						<p className="text-xs text-muted-foreground">
							Successfully answered
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Processing</CardTitle>
						<div className="h-4 w-4 rounded-full bg-yellow-500"></div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-yellow-600">
							{statsLoading ? "..." : questionStats?.pending || 0}
						</div>
						<p className="text-xs text-muted-foreground">
							Currently processing
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Success Rate</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-600">
							{statsLoading
								? "..."
								: questionStats?.total
									? Math.round((questionStats.answered / questionStats.total) * 100)
									: 0
							}%
						</div>
						<p className="text-xs text-muted-foreground">
							Questions answered successfully
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Recent Questions */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Recent Questions</CardTitle>
									<CardDescription>Your latest AI interactions</CardDescription>
								</div>
								<Button variant="outline" size="sm" asChild>
									<Link href="/app/questions">
										View All
										<ChevronRight className="h-4 w-4 ml-1" />
									</Link>
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{questionsLoading ? (
								<div className="space-y-4">
									{[...Array(3)].map((_, i) => (
										<div key={i} className="animate-pulse">
											<div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
											<div className="h-3 bg-gray-200 rounded w-1/2"></div>
										</div>
									))}
								</div>
							) : recentQuestions.length > 0 ? (
								<div className="space-y-4">
									{recentQuestions.map((question) => (
										<div key={question.questionId} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
											<div className="flex items-start justify-between mb-2">
												<div className="flex-1">
													<p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
														{question.question}
													</p>
													<div className="flex items-center gap-3 text-xs text-gray-500">
														<span>Subject: {question.subject?.name}</span>
														<span>•</span>
														<span>{format(new Date(question.createdAt), 'MMM d, h:mm a')}</span>
													</div>
												</div>
												<Badge className={statusColors[question.status]}>
													{statusLabels[question.status]}
												</Badge>
											</div>
											{question.status === 'answered' && question.answer && (
												<div className="mt-2 p-3 bg-green-50 rounded-lg">
													<p className="text-sm text-green-800 line-clamp-3">{question.answer}</p>
												</div>
											)}
											<div className="mt-2 flex items-center justify-between">
												<div className="flex items-center gap-2 text-xs text-gray-500">
													{question.processingTimeMs && (
														<div className="flex items-center gap-1">
															<Clock className="h-3 w-3" />
															{(question.processingTimeMs / 1000).toFixed(1)}s
														</div>
													)}
												</div>
												<Button variant="ghost" size="sm" asChild>
													<Link href={`/app/questions/${question.questionId}`}>
														<Eye className="h-3 w-3 mr-1" />
														View
													</Link>
												</Button>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8">
									<MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
									<p className="text-gray-500 mb-4">Start by asking your first AI question!</p>
									<Button asChild>
										<Link href="/app/chat">
											<Plus className="h-4 w-4 mr-2" />
											Ask Question
										</Link>
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Quick Actions & Subjects */}
				<div className="space-y-6">
					{/* Quick Actions */}
					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
							<CardDescription>Common tasks</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button asChild className="w-full justify-start">
								<Link href="/app/chat">
									<Brain className="h-4 w-4 mr-2" />
									Ask AI Question
								</Link>
							</Button>
							<Button variant="outline" asChild className="w-full justify-start">
								<Link href="/app/subjects">
									<BookOpen className="h-4 w-4 mr-2" />
									Browse Subjects
								</Link>
							</Button>
							<Button variant="outline" asChild className="w-full justify-start">
								<Link href="/app/questions">
									<MessageSquare className="h-4 w-4 mr-2" />
									View History
								</Link>
							</Button>
						</CardContent>
					</Card>

					{/* Popular Subjects */}
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Subjects</CardTitle>
									<CardDescription>Available topics</CardDescription>
								</div>
								<Button variant="ghost" size="sm" asChild>
									<Link href="/app/subjects">
										View All
										<ChevronRight className="h-4 w-4 ml-1" />
									</Link>
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{subjectsLoading ? (
								<div className="space-y-3">
									{[...Array(4)].map((_, i) => (
										<div key={i} className="animate-pulse">
											<div className="h-10 bg-gray-200 rounded"></div>
										</div>
									))}
								</div>
							) : (
								<div className="space-y-2">
									{popularSubjects.map((subject: Subject) => (
										<Link
											key={subject.id}
											href={`/app/chat?subject=${subject.id}`}
											className="flex items-center p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-colors"
										>
											<div className="w-8 h-8 bg-linear-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-medium mr-3">
												{subject.name.charAt(0)}
											</div>
											<div className="flex-1">
												<p className="text-sm font-medium text-gray-900">{subject.name}</p>
												<p className="text-xs text-gray-500 truncate">{subject.description}</p>
											</div>
											<ChevronRight className="h-4 w-4 text-gray-400" />
										</Link>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}