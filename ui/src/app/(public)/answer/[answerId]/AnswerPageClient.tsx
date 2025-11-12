"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from '@/hooks/useSettings';
import aiChatApi from "@/lib/api/ai-chat.api";
import { getFileUrl } from '@/lib/utils';
import { useUserStore } from '@/stores/user.store';
import { ChatMessage, Question } from "@/types/ai-chat";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Bot, CheckCircle, Clock, MessageSquare, Send, User, XCircle } from "lucide-react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface AnswerPageClientProps {
	answerId: string;
}

export default function AnswerPageClient({ answerId }: AnswerPageClientProps) {
	const [question, setQuestion] = useState<Question | null>(null);
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSending, setIsSending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const router = useRouter();
	const currentUser = useUserStore(state => state.user);

	const { data: settings } = useSettings();

	const sendMessage = async () => {
		if (!newMessage.trim() || isSending || !question) return;

		setIsSending(true);
		const message = newMessage.trim();
		setNewMessage("");

		try {
			await aiChatApi.sendChatMessage(answerId, {
				message,
				userId: currentUser?.id,
			});

			// Reload the question to get all messages including the AI response
			await loadQuestion();

			toast.success("Message sent successfully!");
		} catch (error) {
			console.error("Error sending message:", error);
			toast.error("Failed to send message. Please try again.");
			setNewMessage(message); // Restore the message if sending failed
		} finally {
			setIsSending(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const getStatusInfo = (status: string) => {
		switch (status) {
			case "pending":
				return {
					color: "bg-yellow-100 text-yellow-800 border-yellow-200",
					icon: <Clock className="h-3 w-3" />,
					text: "Processing..."
				};
			case "answered":
				return {
					color: "bg-green-100 text-green-800 border-green-200",
					icon: <CheckCircle className="h-3 w-3" />,
					text: "Answered"
				};
			case "failed":
				return {
					color: "bg-red-100 text-red-800 border-red-200",
					icon: <XCircle className="h-3 w-3" />,
					text: "Failed"
				};
			default:
				return {
					color: "bg-gray-100 text-gray-800 border-gray-200",
					icon: <MessageSquare className="h-3 w-3" />,
					text: status
				};
		}
	};

	const formatTimestamp = (timestamp: string) => {
		try {
			return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
		} catch {
			return "Unknown time";
		}
	};

	const loadQuestion = useCallback(async (silently = false) => {
		try {
			setIsLoading(silently ? false : true);
			setError(null);

			const questionData = await aiChatApi.getQuestionWithMessages(answerId);
			setQuestion(questionData);
			setChatMessages(questionData.chatMessages || []);
		} catch (err) {
			setError("Failed to load question. Please try again.");
			console.error("Error loading question:", err);
		} finally {
			setIsLoading(false);
		}
	}, [answerId]);

	useEffect(() => {
		loadQuestion();
	}, [loadQuestion]);

	useEffect(() => {
		if (!question?.status) return;

		let interval: NodeJS.Timeout;
		if (question?.status === "pending") {
			interval = setInterval(() => {
				loadQuestion(true);
			}, 5000); // Poll every 5 seconds
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [loadQuestion, question?.status]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600">Loading your answer...</p>
				</div>
			</div>
		);
	}

	if (error || !question) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<Card className="max-w-md w-full">
					<CardContent className="p-6 text-center">
						<XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
						<h2 className="text-xl font-semibold mb-2">Error Loading Answer</h2>
						<p className="text-gray-600 mb-4">{error || "Answer not found"}</p>
						<Button onClick={() => router.push("/")} variant="outline">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Go Back Home
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const statusInfo = getStatusInfo(question.status);

	console.log(question);


	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-4xl max-h-[calc(100vh-100px)] overflow-y-auto mx-auto p-6">
				{/* Header */}
				{/* <div className="mb-6">

					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold text-gray-900">Question Answer</h1>
						<Badge className={statusInfo.color}>
							{statusInfo.icon}
							<span className="ml-1">{statusInfo.text}</span>
						</Badge>
					</div>
				</div> */}

				{/* Question Card */}
				<Card className="mb-6 bg-white">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg">Your Question</CardTitle>
							<Badge variant="outline">{question.subject?.name}</Badge>
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-gray-700 whitespace-pre-wrap">{question.question}</p>
						{question.fileAttachments && question.fileAttachments.length > 0 && (
							<div className="mt-4">
								<p className="text-sm text-gray-600 mb-2">Attachments:</p>
								<div className="flex flex-wrap gap-2">
									{question.fileAttachments.map((file, index) => (
										<Link key={index} href={`${getFileUrl(file.accessKey)}`} target="_blank" className="flex flex-wrap gap-2">
											<Badge variant="secondary">{file.name}</Badge>
										</Link>
									))}
								</div>
							</div>
						)}
						<div className="mt-4 text-xs text-gray-500">
							Asked {formatTimestamp(question.createdAt)}
						</div>
					</CardContent>
				</Card>

				{/* Answer Card */}
				{question.status === "answered" && question.answer && (
					<Card className="mb-6">
						<CardHeader>
							<CardTitle className="text-lg flex items-center">
								<Bot className="h-5 w-5 mr-2 text-blue-600" />
								AI Answer
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-700 whitespace-pre-wrap">{question.answer}</p>
							{question.processingTimeMs && (
								<div className="mt-4 text-xs text-gray-500">
									Generated in {question.processingTimeMs}ms
									{question.tokenUsage && ` • ${question.tokenUsage} tokens used`}
								</div>
							)}
						</CardContent>
					</Card>
				)}

				{/* Error Message */}
				{question.status === "failed" && question.errorMessage && (
					<Card className="mb-6 border-red-200">
						<CardContent className="p-6">
							<div className="flex items-center text-red-600 mb-2">
								<XCircle className="h-5 w-5 mr-2" />
								<span className="font-medium">Processing Failed</span>
							</div>
							<p className="text-red-700">{question.errorMessage}</p>
							<Button
								variant="outline"
								className="mt-4"
								onClick={() => router.push("/")}
							>
								Try New Question
							</Button>
						</CardContent>
					</Card>
				)}

				{/* Chat Section - Only show if question is answered */}
				{question.status === "answered" && (
					<>
						{/* Chat Messages */}
						{chatMessages.length > 0 && (
							<div className="space-y-4">
								{chatMessages.map((message) => (
									<div
										key={message.messageId}
										className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
									>
										<div
											className={`max-w-[80%] rounded-lg p-3 ${message.role === "user"
												? "bg-blue-600 text-white"
												: "bg-white text-gray-900 border border-gray-200"
												}`}
										>
											<div className="flex items-center mb-1">
												{message.role === "user" ? (
													<User className="h-5 w-5 mr-2" />
												) : (
													<Bot className="h-5 w-5 mr-2 text-primary" />
												)}
												<span className="text-sm font-medium">
													{message.role === "user" ? "You" : "AI"}
												</span>
											</div>
											<p className="whitespace-pre-wrap">{message.content}</p>
											<div className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-500"
												}`}>
												{formatTimestamp(message.createdAt)}
											</div>
										</div>
									</div>
								))}
							</div>
						)}

						{/* Message Input */}
						<div className="flex gap-2 bg-white z-10 mt-3">
							<Textarea
								value={newMessage}
								onChange={(e) => setNewMessage(e.target.value)}
								onKeyPress={handleKeyPress}
								placeholder="Ask a follow-up question..."
								className="flex-1 resize-none min-h-[60px]"
								disabled={isSending}
							/>
							<Button
								onClick={sendMessage}
								disabled={!newMessage.trim() || isSending}
								className="self-end h-[60px] w-[60px]"
							>
								{isSending ? (
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
								) : (
									<Send className="h-4 w-4" />
								)}
							</Button>
						</div>
					</>
				)}
			</div>

			<Dialog open={question.status === "pending"}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle />
						<DialogDescription />
					</DialogHeader>
					<div className=" py-5 bg-gray-50 flex items-center justify-center">
						<div className="text-center">
							<div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
							<p className="text-gray-600">
								Your question is being processed. Please wait...
							</p>
						</div>
					</div>
				</DialogContent>
			</Dialog>

		</div>
	);
}