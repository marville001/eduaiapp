import { FEATURE_ACCESS_KEY, FeatureType, SUBSCRIPTION_REQUIRED_KEY } from '@/common/guards/subscription.guard';
import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to require an active subscription
 */
export const RequireSubscription = () => SetMetadata(SUBSCRIPTION_REQUIRED_KEY, true);

/**
 * Decorator to check feature access limits
 */
export const RequireFeatureAccess = (feature: FeatureType) => SetMetadata(FEATURE_ACCESS_KEY, feature);
