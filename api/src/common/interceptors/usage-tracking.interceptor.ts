import { FEATURE_ACCESS_KEY, FeatureType } from '@/common/guards/subscription.guard';
import { SubscriptionsService } from '@/modules/subscriptions/subscriptions.service';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor to automatically track usage after successful requests
 */
@Injectable()
export class UsageTrackingInterceptor implements NestInterceptor {
	constructor(
		private reflector: Reflector,
		private subscriptionsService: SubscriptionsService,
	) { }

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const featureAccess = this.reflector.get<FeatureType>(FEATURE_ACCESS_KEY, context.getHandler());

		// If no feature access decorator, don't track
		if (!featureAccess) {
			return next.handle();
		}

		const request = context.switchToHttp().getRequest();
		const user = request.user;

		return next.handle().pipe(
			tap(async () => {
				// Track usage after successful request
				if (user) {
					try {
						await this.subscriptionsService.incrementUsage(user.id, featureAccess);
					} catch (error) {
						// Log error but don't fail the request
						console.error('Failed to track usage:', error);
					}
				}
			}),
		);
	}
}
