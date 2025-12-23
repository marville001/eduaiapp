/**
 * Token-based pricing configuration for AI operations
 * Costs are defined per 1000 tokens (similar to how OpenAI bills)
 * 
 * Credit cost formula:
 * total_credits = (input_tokens * input_cost_per_1k / 1000) + (output_tokens * output_cost_per_1k / 1000)
 */

export interface TokenPricingConfig {
	inputCostPer1kTokens: number;  // Credits per 1000 input tokens
	outputCostPer1kTokens: number; // Credits per 1000 output tokens
	minimumCredits: number;        // Minimum credits charged per request
	modelMultiplier?: number;      // Additional multiplier for premium models
}

export interface TokenUsage {
	inputTokens: number;
	outputTokens: number;
	totalTokens: number;
}

export interface TokenCostBreakdown {
	inputTokens: number;
	outputTokens: number;
	totalTokens: number;
	inputCost: number;
	outputCost: number;
	totalCost: number;
	minimumApplied: boolean;
	modelMultiplier: number;
	finalCost: number;
}

/**
 * Default token pricing by AI provider/model
 * These values can be overridden by database settings
 */
export const DEFAULT_TOKEN_PRICING: Record<string, TokenPricingConfig> = {
	// OpenAI Models
	'gpt-4o': {
		inputCostPer1kTokens: 2.5,    // 2.5 credits per 1k input tokens
		outputCostPer1kTokens: 10,    // 10 credits per 1k output tokens
		minimumCredits: 1,
	},
	'gpt-4o-mini': {
		inputCostPer1kTokens: 0.15,   // 0.15 credits per 1k input tokens
		outputCostPer1kTokens: 0.6,   // 0.6 credits per 1k output tokens
		minimumCredits: 1,
	},
	'gpt-4-turbo': {
		inputCostPer1kTokens: 5,      // 5 credits per 1k input tokens
		outputCostPer1kTokens: 15,    // 15 credits per 1k output tokens
		minimumCredits: 1,
	},
	'gpt-3.5-turbo': {
		inputCostPer1kTokens: 0.25,   // 0.25 credits per 1k input tokens
		outputCostPer1kTokens: 0.75,  // 0.75 credits per 1k output tokens
		minimumCredits: 1,
	},
	// Anthropic Models
	'claude-3-opus': {
		inputCostPer1kTokens: 7.5,
		outputCostPer1kTokens: 37.5,
		minimumCredits: 2,
	},
	'claude-3-sonnet': {
		inputCostPer1kTokens: 1.5,
		outputCostPer1kTokens: 7.5,
		minimumCredits: 1,
	},
	'claude-3-haiku': {
		inputCostPer1kTokens: 0.125,
		outputCostPer1kTokens: 0.625,
		minimumCredits: 1,
	},
	// Default fallback
	'default': {
		inputCostPer1kTokens: 1,
		outputCostPer1kTokens: 3,
		minimumCredits: 1,
	},
};

/**
 * Operation type to estimated average tokens
 * Used for pre-authorization checks before the actual AI call
 * These are conservative estimates to ensure users have enough credits
 */
export const ESTIMATED_TOKENS: Record<string, { inputTokens: number; outputTokens: number; }> = {
	'ai_question': { inputTokens: 500, outputTokens: 1500 },      // Average question + context
	'ai_chat_message': { inputTokens: 300, outputTokens: 800 },   // Follow-up messages typically shorter
	'ai_document_analysis': { inputTokens: 2000, outputTokens: 2000 }, // Document analysis can be longer
	'ai_image_generation': { inputTokens: 100, outputTokens: 0 },  // Image gen mainly uses input
	'ai_advanced_model': { inputTokens: 500, outputTokens: 1500 }, // Premium model usage
};

/**
 * Calculate the credit cost based on token usage
 * @param usage - The token usage data
 * @param modelName - The AI model name (used for fallback to default pricing)
 * @param userMultiplier - User's subscription multiplier (default: 1.0)
 * @param modelPricing - Optional pricing from database (AI model configuration)
 */
export function calculateTokenCost(
	usage: TokenUsage,
	modelName: string,
	userMultiplier: number = 1.0,
	modelPricing?: TokenPricingConfig,
): TokenCostBreakdown {
	// Use database pricing if provided, otherwise fall back to defaults
	const pricing = modelPricing || DEFAULT_TOKEN_PRICING[modelName] || DEFAULT_TOKEN_PRICING['default'];

	// Calculate base costs
	const inputCost = (usage.inputTokens * pricing.inputCostPer1kTokens) / 1000;
	const outputCost = (usage.outputTokens * pricing.outputCostPer1kTokens) / 1000;
	const totalCost = inputCost + outputCost;

	// Apply minimum credits rule
	const minimumApplied = totalCost < pricing.minimumCredits;
	const costAfterMinimum = Math.max(totalCost, pricing.minimumCredits);

	// Apply model multiplier if exists
	const modelMultiplier = pricing.modelMultiplier || 1.0;
	const costAfterModelMultiplier = costAfterMinimum * modelMultiplier;

	// Apply user's subscription multiplier
	const finalCost = Math.ceil(costAfterModelMultiplier * userMultiplier);

	return {
		inputTokens: usage.inputTokens,
		outputTokens: usage.outputTokens,
		totalTokens: usage.totalTokens,
		inputCost: Math.round(inputCost * 100) / 100,
		outputCost: Math.round(outputCost * 100) / 100,
		totalCost: Math.round(totalCost * 100) / 100,
		minimumApplied,
		modelMultiplier: modelMultiplier * userMultiplier,
		finalCost,
	};
}

/**
 * Estimate the cost for a given operation type
 * Used for pre-authorization checks
 * @param operationType - The type of AI operation
 * @param modelName - The AI model name
 * @param userMultiplier - User's subscription multiplier (default: 1.0)
 * @param modelPricing - Optional pricing from database (AI model configuration)
 */
export function estimateOperationCost(
	operationType: string,
	modelName: string,
	userMultiplier: number = 1.0,
	modelPricing?: TokenPricingConfig,
): TokenCostBreakdown {
	const estimated = ESTIMATED_TOKENS[operationType] || ESTIMATED_TOKENS['ai_question'];

	return calculateTokenCost(
		{
			inputTokens: estimated.inputTokens,
			outputTokens: estimated.outputTokens,
			totalTokens: estimated.inputTokens + estimated.outputTokens,
		},
		modelName,
		userMultiplier,
		modelPricing,
	);
}

/**
 * Get token pricing for a specific model
 */
export function getTokenPricing(modelName: string): TokenPricingConfig {
	return DEFAULT_TOKEN_PRICING[modelName] || DEFAULT_TOKEN_PRICING['default'];
}
