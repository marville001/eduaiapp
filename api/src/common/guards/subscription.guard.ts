import { SubscriptionsService } from '@/modules/subscriptions/subscriptions.service';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const SUBSCRIPTION_REQUIRED_KEY = 'subscriptionRequired';
export const FEATURE_ACCESS_KEY = 'featureAccess';

export type FeatureType = 'question' | 'chat' | 'upload';

@Injectable()
export class SubscriptionGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private subscriptionsService: SubscriptionsService,
	) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// Check if subscription is required
		const requiresSubscription = this.reflector.getAllAndOverride<boolean>(SUBSCRIPTION_REQUIRED_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		// Check if feature access is required
		const featureAccess = this.reflector.get<FeatureType>(FEATURE_ACCESS_KEY, context.getHandler());

		// If neither decorator is used, allow access
		if (!requiresSubscription && !featureAccess) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!user) {
			throw new ForbiddenException('User not authenticated');
		}

		// Check if user has active subscription
		const subscription = await this.subscriptionsService.getActiveSubscription(user.id);

		if (requiresSubscription && !subscription) {
			throw new ForbiddenException('Active subscription required to access this feature');
		}

		// Check feature access limits
		if (featureAccess) {
			const canPerform = await this.subscriptionsService.canPerformAction(user.id, featureAccess);

			if (!canPerform) {
				const usageStats = await this.subscriptionsService.getUsageStatistics(user.id);

				throw new ForbiddenException({
					message: `You have reached your ${featureAccess} limit for this billing period`,
					usageStats,
					action: featureAccess,
				});
			}

			// Attach subscription to request for later use
			request.subscription = subscription;
		}

		return true;
	}
}
