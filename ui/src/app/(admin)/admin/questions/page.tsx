"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import aiChatApi from "@/lib/api/ai-chat.api";
import { AdminQuestion, AdminQuestionsParams, QuestionStatus } from "@/types/ai-chat";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, Eye, Filter, MessageSquare, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import QuestionDetailsModal from "./components/question-details-modal";

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

export default function AdminQuestionsPage() {
	const [selectedQuestion, setSelectedQuestion] = useState<AdminQuestion | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [filters, setFilters] = useState<AdminQuestionsParams>({
		page: 1,
		limit: 20,
		status: undefined,
		search: "",
	});

	// Fetch questions with current filters
	const { data: questionsData, isLoading, error } = useQuery({
		queryKey: ['admin-questions', filters],
		queryFn: () => aiChatApi.getAllQuestions(filters),
		placeholderData: (prevData) => prevData,
	});

	console.log({ questionsData });


	const handleQuestionClick = async (question: AdminQuestion) => {
		try {
			// Fetch full question details
			const fullQuestion = await aiChatApi.getQuestionForAdmin(question.questionId);
			setSelectedQuestion(fullQuestion);
			setIsModalOpen(true);
		} catch (err) {
			console.error('Failed to load question details:', err);
			toast.error("Failed to load question details");
		}
	};

	const handleSearch = (search: string) => {
		setFilters({ ...filters, search, page: 1 });
	};

	const handleStatusFilter = (status: string | undefined) => {
		setFilters({
			...filters,
			status: status && status !== "all" ? status as QuestionStatus : undefined,
			page: 1
		});
	};

	const handlePageChange = (page: number) => {
		setFilters({ ...filters, page });
	};

	const totalPages = questionsData ? Math.ceil(questionsData.total / (filters.limit || 20)) : 0;

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<p className="text-red-600">Failed to load questions. Please try again.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Questions Management</h1>
					<p className="text-muted-foreground">
						View and manage all user questions
					</p>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Questions</CardTitle>
						<MessageSquare className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{questionsData?.total || 0}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Answered</CardTitle>
						<div className="h-4 w-4 rounded-full bg-green-500"></div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{questionsData?.questions.filter(q => q.status === 'answered').length || 0}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Processing</CardTitle>
						<div className="h-4 w-4 rounded-full bg-yellow-500"></div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{questionsData?.questions.filter(q => q.status === 'pending').length || 0}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Failed</CardTitle>
						<div className="h-4 w-4 rounded-full bg-red-500"></div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{questionsData?.questions.filter(q => q.status === 'failed').length || 0}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle>Filters</CardTitle>
					<CardDescription>Filter questions by status or search</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex gap-4 flex-wrap">
						<div className="flex-1 min-w-[200px]">
							<div className="relative">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search questions, users, or subjects..."
									value={filters.search || ""}
									onChange={(e) => handleSearch(e.target.value)}
									className="pl-8"
								/>
							</div>
						</div>
						<Select
							value={filters.status || "all"}
							onValueChange={handleStatusFilter}
						>
							<SelectTrigger className="w-[180px]">
								<Filter className="mr-2 h-4 w-4" />
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="pending">Processing</SelectItem>
								<SelectItem value="answered">Answered</SelectItem>
								<SelectItem value="failed">Failed</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Questions Table */}
			<Card>
				<CardHeader>
					<CardTitle>Questions</CardTitle>
					<CardDescription>
						Showing {questionsData?.questions.length || 0} of {questionsData?.total || 0} questions
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-3">
							{[...Array(5)].map((_, i) => (
								<div key={i} className="animate-pulse">
									<div className="h-12 bg-gray-200 rounded"></div>
								</div>
							))}
						</div>
					) : (
						<div className="space-y-4">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Question</TableHead>
										<TableHead>User</TableHead>
										<TableHead>Subject</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Created</TableHead>
										<TableHead>Processing Time</TableHead>
										<TableHead className="w-20">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{questionsData?.questions.map((question) => (
										<TableRow key={question.questionId}>
											<TableCell className="max-w-md">
												<div className="space-y-1">
													<p className="font-medium line-clamp-2">
														{question.question}
													</p>
													{question.fileAttachments && question.fileAttachments.length > 0 && (
														<div className="flex items-center gap-1 text-xs text-muted-foreground">
															📎 {question.fileAttachments.length} attachment(s)
														</div>
													)}
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
														{question.user?.name?.charAt(0) || question.user?.email?.charAt(0) || '?'}
													</div>
													<div>
														<p className="text-sm font-medium">{question.user?.name || 'Anonymous'}</p>
														<p className="text-xs text-muted-foreground">{question.user?.email}</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant="outline">
													{question.subject?.name}
												</Badge>
											</TableCell>
											<TableCell>
												<Badge className={statusColors[question.status]}>
													{statusLabels[question.status]}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="text-sm">
													<div className="font-medium">
														{format(new Date(question.createdAt), 'MMM d, yyyy')}
													</div>
													<div className="text-muted-foreground">
														{format(new Date(question.createdAt), 'h:mm a')}
													</div>
												</div>
											</TableCell>
											<TableCell>
												{question.processingTimeMs ? (
													<div className="flex items-center gap-1 text-sm">
														<Clock className="h-3 w-3" />
														{(question.processingTimeMs / 1000).toFixed(2)}s
													</div>
												) : (
													<span className="text-muted-foreground">-</span>
												)}
											</TableCell>
											<TableCell>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleQuestionClick(question)}
												>
													<Eye className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="flex items-center justify-between">
									<p className="text-sm text-muted-foreground">
										Page {filters.page || 1} of {totalPages}
									</p>
									<div className="flex items-center space-x-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handlePageChange((filters.page || 1) - 1)}
											disabled={(filters.page || 1) <= 1}
										>
											<ChevronLeft className="h-4 w-4" />
											Previous
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handlePageChange((filters.page || 1) + 1)}
											disabled={(filters.page || 1) >= totalPages}
										>
											Next
											<ChevronRight className="h-4 w-4" />
										</Button>
									</div>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Question Details Modal */}
			{selectedQuestion && (
				<QuestionDetailsModal
					question={selectedQuestion}
					isOpen={isModalOpen}
					onClose={() => {
						setIsModalOpen(false);
						setSelectedQuestion(null);
					}}
				/>
			)}
		</div>
	);
}