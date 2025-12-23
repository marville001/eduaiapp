import { CreditService } from '@/modules/billing/credit.service';
import { CreditTransactionType } from '@/modules/billing/entities/credit-transaction.entity';
import { TokenUsage } from '@/modules/billing/token-pricing.config';
import {
	CallHandler,
	ExecutionContext,
	Injectable,
	Logger,
	NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Interceptor that consumes credits after successful AI operations
 * Works with @RequireCredits decorator and CreditGuard
 * 
 * NEW: Supports token-based pricing by extracting actual token usage
 * from the AI response and calculating the real cost.
 */
@Injectable()
export class CreditConsumptionInterceptor implements NestInterceptor {
	private readonly logger = new Logger(CreditConsumptionInterceptor.name);

	constructor(
		private readonly creditService: CreditService,
		private readonly reflector: Reflector,
	) { }

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest();
		const creditInfo = request.creditInfo;

		console.log({ creditInfo });


		// If no credit info (guard didn't run or no credits required), just proceed
		if (!creditInfo) {
			return next.handle();
		}

		// Skip credit consumption for public requests without a user
		if (creditInfo.skipCredits) {
			return next.handle();
		}

		const { transactionType, modelName } = creditInfo;
		const user = request.user as JwtPayload;
		const handler = context.getHandler();
		const handlerName = handler.name;

		// Get userId from JWT auth or from creditInfo (for public endpoints with userId in body)
		const userId = user?.sub || creditInfo.userId;

		// If no userId available, skip credit consumption
		if (!userId) {
			this.logger.debug('No userId available, skipping credit consumption');
			return next.handle();
		}

		return next.handle().pipe(
			tap({
				next: async (responseData) => {
					console.log("Processing credit consumption with token-based pricing");

					// Only consume credits on successful response
					try {
						// Extract reference info from response if available
						let referenceId: string | undefined;
						let referenceType: string | undefined;

						if (responseData?.data?.questionId) {
							referenceId = responseData.data.questionId;
							referenceType = 'question';
						} else if (responseData?.data?.id) {
							referenceId = responseData.data.id.toString();
							referenceType = 'ai_response';
						}

						// Extract token usage from response (if AI operation returned it)
						const tokenUsage = this.extractTokenUsage(responseData);
						const aiModelName = this.extractModelName(responseData) || modelName;

						const result = await this.creditService.consumeCredits({
							userId,
							transactionType,
							description: this.getDescription(transactionType, handlerName),
							referenceId,
							referenceType,
							ipAddress: request.ip,
							userAgent: request.headers['user-agent'],
							metadata: {
								endpoint: request.url,
								method: request.method,
								isPublicRequest: creditInfo.isPublicRequest,
							},
							// Token-based pricing fields
							tokenUsage,
							modelName: aiModelName,
						});

						console.log({ result });


						if (result.success) {
							const tokenInfo = tokenUsage
								? ` (${tokenUsage.inputTokens} in / ${tokenUsage.outputTokens} out tokens)`
								: '';

							this.logger.log(
								`Consumed ${Math.abs(result.transaction?.amount || 0)} credits for user ${userId}. ` +
								`Transaction: ${transactionType}${tokenInfo}, Balance: ${result.remainingBalance}`
							);

							// Add credit info to response
							if (responseData && typeof responseData === 'object') {
								responseData.creditInfo = {
									consumed: Math.abs(result.transaction?.amount || 0),
									remaining: result.remainingBalance,
									tokenUsage: tokenUsage ? {
										inputTokens: tokenUsage.inputTokens,
										outputTokens: tokenUsage.outputTokens,
										totalTokens: tokenUsage.totalTokens,
									} : undefined,
									tokenCostBreakdown: result.tokenCostBreakdown,
								};
							}
						} else {
							this.logger.warn(
								`Failed to consume credits for user ${userId}: ${result.error}`
							);
						}
					} catch (error) {
						// Log but don't fail the request if credit consumption fails
						this.logger.error(
							`Error consuming credits for user ${userId}:`,
							error
						);
					}
				},
				error: (error) => {
					// Don't consume credits on error
					this.logger.debug(
						`Not consuming credits due to error: ${error.message}`
					);
				},
			}),
		);
	}

	/**
	 * Extract token usage from the AI response
	 * Supports various response formats from different AI providers
	 */
	private extractTokenUsage(responseData: any): TokenUsage | undefined {
		if (!responseData) return undefined;

		// Check for token usage in various locations
		const sources = [
			responseData?.data?.tokenUsage,
			responseData?.tokenUsage,
			responseData?.data?.metadata,
			responseData?.metadata,
			responseData?.data,
		];

		for (const source of sources) {
			if (source && typeof source === 'object') {
				// Check for detailed token usage
				if (source.inputTokens !== undefined || source.outputTokens !== undefined) {
					return {
						inputTokens: source.inputTokens || 0,
						outputTokens: source.outputTokens || 0,
						totalTokens: source.totalTokens || (source.inputTokens || 0) + (source.outputTokens || 0),
					};
				}
				// Check for OpenAI-style usage
				if (source.input_tokens !== undefined || source.output_tokens !== undefined) {
					return {
						inputTokens: source.input_tokens || 0,
						outputTokens: source.output_tokens || 0,
						totalTokens: source.total_tokens || (source.input_tokens || 0) + (source.output_tokens || 0),
					};
				}
			}
		}

		return undefined;
	}

	/**
	 * Extract model name from the AI response
	 */
	private extractModelName(responseData: any): string | undefined {
		if (!responseData) return undefined;

		const sources = [
			responseData?.data?.modelName,
			responseData?.modelName,
			responseData?.data?.metadata?.modelName,
			responseData?.metadata?.modelName,
			responseData?.data?.model,
			responseData?.model,
		];

		for (const source of sources) {
			if (typeof source === 'string' && source.length > 0) {
				return source;
			}
		}

		return undefined;
	}

	private getDescription(transactionType: CreditTransactionType, handlerName: string): string {
		const descriptions: Record<CreditTransactionType, string> = {
			[CreditTransactionType.AI_QUESTION]: 'AI Question asked',
			[CreditTransactionType.AI_CHAT_MESSAGE]: 'AI Chat message sent',
			[CreditTransactionType.AI_DOCUMENT_ANALYSIS]: 'Document analyzed by AI',
			[CreditTransactionType.AI_IMAGE_GENERATION]: 'AI Image generated',
			[CreditTransactionType.AI_ADVANCED_MODEL]: 'Advanced AI model used',
			[CreditTransactionType.FEATURE_USAGE]: `Feature used: ${handlerName}`,
			// Other types won't be used here but need to be defined
			[CreditTransactionType.SUBSCRIPTION_ALLOCATION]: '',
			[CreditTransactionType.SUBSCRIPTION_RENEWAL]: '',
			[CreditTransactionType.TOP_UP_PURCHASE]: '',
			[CreditTransactionType.PROMOTIONAL]: '',
			[CreditTransactionType.REFUND]: '',
			[CreditTransactionType.ADMIN_ADJUSTMENT]: '',
			[CreditTransactionType.SIGNUP_BONUS]: '',
			[CreditTransactionType.REFERRAL_BONUS]: '',
			[CreditTransactionType.EXPIRATION]: '',
			[CreditTransactionType.SUBSCRIPTION_DOWNGRADE]: '',
			[CreditTransactionType.SUBSCRIPTION_CANCELLATION]: '',
		};

		return descriptions[transactionType] || `AI operation: ${handlerName}`;
	}
}
