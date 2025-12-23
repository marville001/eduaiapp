import { CreditService } from '@/modules/billing/credit.service';
import { CreditTransactionType } from '@/modules/billing/entities/credit-transaction.entity';
import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export const CREDIT_COST_KEY = 'creditCost';

/**
 * Decorator to specify credit requirements for an endpoint
 * 
 * With token-based pricing, this now serves as a pre-authorization check
 * using estimated token usage. The actual cost is calculated and charged
 * after the AI operation completes based on real token counts.
 */
export function RequireCredits(
	transactionType: CreditTransactionType,
	customAmount?: number,
	modelName?: string,
) {
	return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
		Reflect.defineMetadata(CREDIT_COST_KEY, { transactionType, customAmount, modelName }, descriptor.value);
		return descriptor;
	};
}

/**
 * Guard that checks if user has sufficient credits before allowing access
 * Use with @RequireCredits decorator
 * 
 * For AI operations, this uses token-based estimation to verify the user
 * likely has enough credits. The actual cost is charged after the operation.
 * 
 * Supports both authenticated users (via JWT) and public endpoints (via userId in body).
 */
@Injectable()
export class CreditGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly creditService: CreditService,
	) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const creditConfig = this.reflector.get<{
			transactionType: CreditTransactionType;
			customAmount?: number;
			modelName?: string;
		}>(CREDIT_COST_KEY, context.getHandler());

		// If no credit requirement specified, allow access
		if (!creditConfig) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const user = request.user as JwtPayload;

		// Try to get userId from JWT auth first, then fall back to request body
		let userId: number | undefined;

		if (user?.sub) {
			userId = user.sub;
		} else if (request.body?.userId) {
			// For public endpoints, userId can be passed in body
			userId = Number(request.body.userId);
		}

		// If no userId available, allow the request (public access without credit tracking)
		if (!userId) {
			// Store credit info indicating this is a public request without user
			request.creditInfo = {
				transactionType: creditConfig.transactionType,
				isPublicRequest: true,
				skipCredits: true,
			};
			return true;
		}

		const { transactionType, customAmount, modelName } = creditConfig;

		// Use the new token-based estimation for pre-authorization
		const result = await this.creditService.canPerformOperation(
			userId,
			transactionType,
			customAmount,
			modelName,
		);

		if (!result.allowed) {
			throw new ForbiddenException({
				message: 'Insufficient credits',
				error: 'INSUFFICIENT_CREDITS',
				data: {
					required: result.cost,
					available: result.balance,
					shortfall: result.shortfall,
					estimatedTokens: result.estimatedTokens,
				},
			});
		}

		// Store the credit info in request for later consumption by the interceptor
		request.creditInfo = {
			transactionType,
			estimatedCost: result.cost,
			balance: result.balance,
			estimatedTokens: result.estimatedTokens,
			modelName,
			userId, // Store the userId for the interceptor
			isPublicRequest: !user?.sub, // Mark if this came from body instead of JWT
		};

		return true;
	}
}
