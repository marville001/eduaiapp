// AI Chat Types
export interface Question {
	questionId: string;
	subject: string;
	question: string;
	answer?: string;
	status: 'pending' | 'answered' | 'failed';
	userId: string;
	aiModelId?: string;
	processingTimeMs?: number;
	tokenUsage?: number;
	fileAttachments?: string[];
	errorMessage?: string;
	createdAt: string;
	updatedAt: string;
	user?: {
		id: string;
		name: string;
		email: string;
	};
	chatMessages?: ChatMessage[];
}

export interface ChatMessage {
	messageId: string;
	questionId: string;
	userId: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	aiModelId?: string;
	tokenUsage?: number;
	processingTimeMs?: number;
	metadata?: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
	user?: {
		id: string;
		name: string;
		email: string;
	};
}

export interface QuestionStats {
	total: number;
	answered: number;
	pending: number;
	failed: number;
}

// Request types
export interface AskQuestionRequest {
	subject: number;
	question: string;
	fileAttachments?: string[];
	userId?: number;

}

export interface SendChatMessageRequest {
	message: string;
	userId?: string;
}

// UI State types
export interface ChatState {
	messages: ChatMessage[];
	isLoading: boolean;
	error?: string;
}

export interface QuestionFormState {
	isSubmitting: boolean;
	error?: string;
	success?: boolean;
}

// Helper types
export type QuestionStatus = 'pending' | 'answered' | 'failed';
export type MessageRole = 'user' | 'assistant' | 'system';

// Display helpers
export interface QuestionDisplayInfo {
	statusColor: string;
	statusIcon: string;
	statusText: string;
}

export interface MessageDisplayInfo {
	isUser: boolean;
	isAssistant: boolean;
	isSystem: boolean;
	roleDisplay: string;
	timestamp: string;
}