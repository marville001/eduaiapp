"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { AdminQuestion } from "@/types/ai-chat";
import { User as UserType } from '@/types/users';
import { format } from "date-fns";
import {
	Brain,
	Calendar,
	Clock,
	Download,
	FileText,
	MessageSquare,
	User,
	X
} from "lucide-react";

interface QuestionDetailsModalProps {
	question: AdminQuestion;
	isOpen: boolean;
	onClose: () => void;
}

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

export default function QuestionDetailsModal({
	question,
	isOpen,
	onClose,
}: QuestionDetailsModalProps) {
	const getUserName = (user?: UserType | null) => {
		if (!user) return 'Anonymous';

		if (user?.firstName || user?.lastName) return `${user.firstName || ''} ${user.lastName || ''}`.trim();
		if (user?.email) return user.email;
		return 'Anonymous';
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl! max-h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center justify-between">
						<span>Question Details</span>
						{/* <Button variant="ghost" size="sm" onClick={onClose}>
							<X className="h-4 w-4" />
						</Button> */}
					</DialogTitle>
					<DialogDescription>
						Question ID: {question.questionId}
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto">
					<div className="space-y-6 pr-4">
						{/* Question Overview */}
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<Badge className={statusColors[question.status]}>
									{statusLabels[question.status]}
								</Badge>
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Calendar className="h-4 w-4" />
									{format(new Date(question.createdAt), 'PPP p')}
								</div>
								{question.processingTimeMs && (
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Clock className="h-4 w-4" />
										{(question.processingTimeMs / 1000).toFixed(2)}s
									</div>
								)}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* User Info */}
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm font-medium">
										<User className="h-4 w-4" />
										User Information
									</div>
									<div className="bg-gray-50 p-3 rounded-lg">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
												{getUserName(question.user)?.charAt(0) || '?'}
											</div>
											<div>
												<p className="font-medium">{getUserName(question.user)}</p>
												<p className="text-sm text-muted-foreground">{question.user?.email}</p>
												{question.user?.role && (
													<Badge variant="outline" className="text-xs">
														{question.user.role}
													</Badge>
												)}
											</div>
										</div>
									</div>
								</div>

								{/* Subject & AI Model */}
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm font-medium">
										<Brain className="h-4 w-4" />
										Subject & Model
									</div>
									<div className="bg-gray-50 p-3 rounded-lg space-y-2">
										<div>
											<span className="text-sm text-muted-foreground">Subject:</span>
											<Badge variant="outline" className="ml-2">
												{question.subject?.name}
											</Badge>
										</div>
										{question.aiModel && (
											<div>
												<span className="text-sm text-muted-foreground">AI Model:</span>
												<Badge variant="outline" className="ml-2">
													{question.aiModel.displayName} ({question.aiModel.provider})
												</Badge>
											</div>
										)}
										{question.tokenUsage && (
											<div>
												<span className="text-sm text-muted-foreground">Tokens Used:</span>
												<span className="ml-2 text-sm font-mono">{question.tokenUsage}</span>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>

						<div className="border-t border-gray-200"></div>

						{/* Question */}
						<div className="space-y-3">
							<div className="flex items-center gap-2 font-medium">
								<MessageSquare className="h-4 w-4" />
								Question
							</div>
							<div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
								<p className="whitespace-pre-wrap">{question.question}</p>
							</div>
						</div>

						{/* File Attachments */}
						{question.fileAttachments && question.fileAttachments.length > 0 && (
							<>
								<div className="border-t border-gray-200"></div>
								<div className="space-y-3">
									<div className="flex items-center gap-2 font-medium">
										<FileText className="h-4 w-4" />
										Attachments ({question.fileAttachments.length})
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										{question.fileAttachments.map((file, index) => (
											<div key={index} className="border rounded-lg p-3 space-y-2">
												<div className="flex items-center justify-between">
													<div>
														<p className="font-medium text-sm">{file.name}</p>
														<p className="text-xs text-muted-foreground">
															{file.mimeType} • {(file.size / 1024).toFixed(1)} KB
														</p>
													</div>
													<Button size="sm" variant="outline" asChild>
														<a href={file.url} target="_blank" rel="noopener noreferrer">
															<Download className="h-3 w-3" />
														</a>
													</Button>
												</div>
											</div>
										))}
									</div>
								</div>
							</>
						)}

						{/* Answer */}
						{question.status === 'answered' && question.answer && (
							<>
								<div className="border-t border-gray-200"></div>
								<div className="space-y-3">
									<div className="flex items-center gap-2 font-medium">
										<Brain className="h-4 w-4" />
										AI Response
									</div>
									<div className="bg-green-50 border border-green-200 p-4 rounded-lg">
										<p className="whitespace-pre-wrap">{question.answer}</p>
									</div>
								</div>
							</>
						)}

						{/* Error Message */}
						{question.status === 'failed' && question.errorMessage && (
							<>
								<div className="border-t border-gray-200"></div>
								<div className="space-y-3">
									<div className="flex items-center gap-2 font-medium text-red-600">
										<X className="h-4 w-4" />
										Error Details
									</div>
									<div className="bg-red-50 border border-red-200 p-4 rounded-lg">
										<p className="text-red-800">{question.errorMessage}</p>
									</div>
								</div>
							</>
						)}

						{/* Chat Messages */}
						{question.chatMessages && question.chatMessages.length > 0 && (
							<>
								<div className="border-t border-gray-200"></div>
								<div className="space-y-3">
									<div className="flex items-center gap-2 font-medium">
										<MessageSquare className="h-4 w-4" />
										Chat History ({question.chatMessages.length} messages)
									</div>
									<div className="space-y-3 max-h-80 overflow-y-auto">
										{question.chatMessages.map((message, index) => (
											<div
												key={index}
												className={`p-3 rounded-lg border ${message.role === 'user'
													? 'bg-blue-50 border-blue-200 ml-8'
													: 'bg-gray-50 border-gray-200 mr-8'
													}`}
											>
												<div className="flex items-center justify-between mb-2">
													<Badge variant={message.role === 'user' ? 'default' : 'secondary'}>
														{message.role === 'user' ? 'User' : 'Assistant'}
													</Badge>
													<span className="text-xs text-muted-foreground">
														{format(new Date(message.createdAt), 'MMM d, h:mm a')}
													</span>
												</div>
												<p className="text-sm whitespace-pre-wrap">{message.content}</p>
											</div>
										))}
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}