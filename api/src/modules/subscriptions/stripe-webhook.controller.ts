import { BadRequestException, Controller, Headers, Logger, Post, RawBodyRequest, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import Stripe from 'stripe';
import { StripeSettingsService } from '../settings/stripe-settings.service';
import { StripeService } from './stripe.service';
import { SubscriptionsService } from './subscriptions.service';

@Controller('webhooks/stripe')
export class StripeWebhookController {
	private readonly logger = new Logger(StripeWebhookController.name);

	constructor(
		private readonly stripeService: StripeService,
		private readonly subscriptionsService: SubscriptionsService,
		private readonly configService: ConfigService,
		private readonly stripeSettingsService: StripeSettingsService
	) { }

	@Post()
	async handleWebhook(@Req() request: RawBodyRequest<Request>, @Headers('stripe-signature') signature: string) {
		if (!signature) {
			throw new BadRequestException('Missing stripe-signature header');
		}

		const webhookSecret = await this.stripeSettingsService.getDecryptedWebhookSecret();

		if (!webhookSecret) {
			this.logger.error('Stripe webhook secret not configured');
			throw new BadRequestException('Webhook not configured');
		}

		let event: Stripe.Event;

		try {
			// Verify webhook signature
			event = await this.stripeService.verifyWebhookSignature(request.rawBody!, signature, webhookSecret);
		} catch (error) {
			this.logger.error('Webhook signature verification failed', error);
			throw new BadRequestException('Invalid signature');
		}

		console.log(event);

		this.logger.log(`Received webhook event: ${event.type}`);

		try {
			// Handle the event
			switch (event.type) {
				case 'checkout.session.completed':
					await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
					break;

				case 'customer.subscription.created':
				case 'customer.subscription.updated':
					await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
					break;

				case 'customer.subscription.deleted':
					await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
					break;

				case 'invoice.payment_succeeded':
					await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
					break;

				case 'invoice.payment_failed':
					await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
					break;

				case 'customer.subscription.trial_will_end':
					await this.handleTrialWillEnd(event.data.object as Stripe.Subscription);
					break;

				default:
					this.logger.log(`Unhandled event type: ${event.type}`);
			}

			return { received: true };
		} catch (error) {
			this.logger.error(`Error processing webhook: ${event.type}`, error);
			throw error;
		}
	}

	private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
		this.logger.log(`Checkout session completed: ${session.id}`);
		await this.subscriptionsService.handleCheckoutCompleted(session);
	}

	private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
		this.logger.log(`Subscription updated: ${subscription.id}`);
		await this.subscriptionsService.handleSubscriptionUpdated(subscription);
	}

	private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
		this.logger.log(`Subscription deleted: ${subscription.id}`);
		await this.subscriptionsService.handleSubscriptionDeleted(subscription);
	}

	private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
		this.logger.log(`Invoice payment succeeded: ${invoice.id}`);
		await this.subscriptionsService.handleInvoicePaymentSucceeded(invoice);
	}

	private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
		this.logger.log(`Invoice payment failed: ${invoice.id}`);
		await this.subscriptionsService.handleInvoicePaymentFailed(invoice);
	}

	private async handleTrialWillEnd(subscription: Stripe.Subscription) {
		this.logger.log(`Trial will end: ${subscription.id}`);
		// You can send notification email here
	}
}
