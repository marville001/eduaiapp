import { CreditService } from '@/modules/billing/credit.service';
import { CreditTransactionType } from '@/modules/billing/entities/credit-transaction.entity';
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

		const { transactionType, cost } = creditInfo;
		const user = request.user as JwtPayload;
		const handler = context.getHandler();
		const handlerName = handler.name;

		return next.handle().pipe(
			tap({
				next: async (responseData) => {
					console.log("HERERREEEEEEEE");

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

						const result = await this.creditService.consumeCredits({
							userId: user.sub,
							transactionType,
							amount: cost,
							description: this.getDescription(transactionType, handlerName),
							referenceId,
							referenceType,
							ipAddress: request.ip,
							userAgent: request.headers['user-agent'],
							metadata: {
								endpoint: request.url,
								method: request.method,
							},
						});

						console.log({ result });


						if (result.success) {
							this.logger.log(
								`Consumed ${cost} credits for user ${user.sub}. ` +
								`Transaction: ${transactionType}, Balance: ${result.remainingBalance}`
							);

							// Add credit info to response
							if (responseData && typeof responseData === 'object') {
								responseData.creditInfo = {
									consumed: cost,
									remaining: result.remainingBalance,
								};
							}
						} else {
							this.logger.warn(
								`Failed to consume credits for user ${user.sub}: ${result.error}`
							);
						}
					} catch (error) {
						// Log but don't fail the request if credit consumption fails
						this.logger.error(
							`Error consuming credits for user ${user.sub}:`,
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
