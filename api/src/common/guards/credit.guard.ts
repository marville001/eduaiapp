import { CREDIT_COSTS, CreditService } from '@/modules/billing/credit.service';
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
 * Decorator to specify credit cost for an endpoint
 */
export function RequireCredits(
	transactionType: CreditTransactionType,
	customAmount?: number,
) {
	return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
		Reflect.defineMetadata(CREDIT_COST_KEY, { transactionType, customAmount }, descriptor.value);
		return descriptor;
	};
}

/**
 * Guard that checks if user has sufficient credits before allowing access
 * Use with @RequireCredits decorator
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
		}>(CREDIT_COST_KEY, context.getHandler());

		// If no credit requirement specified, allow access
		if (!creditConfig) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const user = request.user as JwtPayload;

		if (!user || !user.sub) {
			throw new ForbiddenException('Authentication required');
		}

		const { transactionType, customAmount } = creditConfig;
		const cost = customAmount || CREDIT_COSTS[transactionType] || 1;

		const result = await this.creditService.canPerformOperation(
			user.sub,
			transactionType,
			cost,
		);

		if (!result.allowed) {
			throw new ForbiddenException({
				message: 'Insufficient credits',
				error: 'INSUFFICIENT_CREDITS',
				data: {
					required: result.cost,
					available: result.balance,
					shortfall: result.shortfall,
				},
			});
		}

		// Store the credit info in request for later consumption
		request.creditInfo = {
			transactionType,
			cost,
			balance: result.balance,
		};

		return true;
	}
}
