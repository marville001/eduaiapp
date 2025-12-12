import stripeConfig from '@/config/stripe.config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPackage } from '../settings/entities/subscription-package.entity';
import { SettingsModule } from '../settings/settings.module';
import { SubscriptionPackageRepository } from '../settings/subscription-package.repository';
import { UserSubscription } from './entities/user-subscription.entity';
import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeService } from './stripe.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { UserSubscriptionRepository } from './user-subscription.repository';

@Module({
	imports: [
		EventEmitterModule.forRoot(),
		ConfigModule.forFeature(stripeConfig),
		TypeOrmModule.forFeature([UserSubscription, SubscriptionPackage]),
		SettingsModule
	],
	controllers: [SubscriptionsController, StripeWebhookController],
	providers: [
		SubscriptionsService,
		StripeService,
		UserSubscriptionRepository,
		SubscriptionPackageRepository,
	],
	exports: [SubscriptionsService, StripeService, UserSubscriptionRepository],
})
export class SubscriptionsModule { }
