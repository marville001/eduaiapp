import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeSettingsService } from '../settings/stripe-settings.service';

@Injectable()
export class StripeService {
	private stripe: Stripe;
	private readonly logger = new Logger(StripeService.name);

	constructor(
		private configService: ConfigService,
		private readonly stripeSettingsSerive: StripeSettingsService
	) { }

	async getStripe(): Promise<Stripe> {
		if (!this.stripe) {
			const stripeKey = await this.stripeSettingsSerive.getDecryptedSecretKey();
			if (!stripeKey) {
				throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in stripe settings.');
			}

			console.log({ stripeKey });
			return new Stripe(stripeKey, {
				apiVersion: '2025-11-17.clover',
				typescript: true,
			});
		}
		return this.stripe;
	}

	isConfigured(): boolean {
		return !!this.stripe;
	}

	/**
	 * Create a new Stripe customer
	 */
	async createCustomer(email: string, name?: string, metadata?: Record<string, string>): Promise<Stripe.Customer> {
		const stripe = await this.getStripe();
		return stripe.customers.create({
			email,
			name,
			metadata,
		});
	}

	/**
	 * Get customer by ID
	 */
	async getCustomer(customerId: string): Promise<Stripe.Customer> {
		const stripe = await this.getStripe();
		return stripe.customers.retrieve(customerId) as Promise<Stripe.Customer>;
	}

	/**
	 * Update customer
	 */
	async updateCustomer(customerId: string, data: Stripe.CustomerUpdateParams): Promise<Stripe.Customer> {
		const stripe = await this.getStripe();
		return stripe.customers.update(customerId, data);
	}

	/**
	 * Create a checkout session for subscription
	 */
	async createCheckoutSession(params: {
		customerId?: string;
		customerEmail?: string;
		priceId: string;
		successUrl: string;
		cancelUrl: string;
		metadata?: Record<string, string>;
		trialPeriodDays?: number;
		promotionCode?: string;
	}): Promise<Stripe.Checkout.Session> {
		const stripe = await this.getStripe();

		const sessionParams: Stripe.Checkout.SessionCreateParams = {
			mode: 'subscription',
			line_items: [
				{
					price: params.priceId,
					quantity: 1,
				},
			],
			success_url: params.successUrl,
			cancel_url: params.cancelUrl,
			metadata: params.metadata,
			subscription_data: {
				trial_period_days: params.trialPeriodDays || 0,
				metadata: params.metadata,
			},
		};

		// Add customer or email
		if (params.customerId) {
			sessionParams.customer = params.customerId;
		} else if (params.customerEmail) {
			sessionParams.customer_email = params.customerEmail;
		}

		// Add trial period
		if (params.trialPeriodDays && params.trialPeriodDays > 0) {
			sessionParams.subscription_data!.trial_period_days = params.trialPeriodDays;
		}

		// Add promotion code
		if (params.promotionCode) {
			sessionParams.discounts = [{ promotion_code: params.promotionCode }];
		}

		return stripe.checkout.sessions.create(sessionParams);
	}

	/**
	 * Get subscription by ID
	 */
	async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
		const stripe = await this.getStripe();
		return stripe.subscriptions.retrieve(subscriptionId);
	}

	/**
	 * Cancel subscription
	 */
	async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<Stripe.Subscription> {
		const stripe = await this.getStripe();

		if (cancelAtPeriodEnd) {
			return stripe.subscriptions.update(subscriptionId, {
				cancel_at_period_end: true,
			});
		} else {
			return stripe.subscriptions.cancel(subscriptionId);
		}
	}

	/**
	 * Reactivate a subscription
	 */
	async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
		const stripe = await this.getStripe();
		return stripe.subscriptions.update(subscriptionId, {
			cancel_at_period_end: false,
		});
	}

	/**
	 * Update subscription (change price/plan)
	 */
	async updateSubscription(subscriptionId: string, newPriceId: string, prorate: boolean = true): Promise<Stripe.Subscription> {
		const stripe = await this.getStripe();

		// Get current subscription
		const subscription = await stripe.subscriptions.retrieve(subscriptionId);

		return stripe.subscriptions.update(subscriptionId, {
			items: [
				{
					id: subscription.items.data[0].id,
					price: newPriceId,
				},
			],
			proration_behavior: prorate ? 'create_prorations' : 'none',
		});
	}

	/**
	 * Create a billing portal session
	 */
	async createBillingPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
		const stripe = await this.getStripe();
		return stripe.billingPortal.sessions.create({
			customer: customerId,
			return_url: returnUrl,
		});
	}

	/**
	 * Get upcoming invoice for customer
	 */
	async getUpcomingInvoice(customerId: string, subscriptionId?: string) {
		return [];
	}

	/**
	 * List invoices for a customer
	 */
	async listInvoices(customerId: string, limit: number = 10): Promise<Stripe.ApiList<Stripe.Invoice>> {
		const stripe = await this.getStripe();
		return stripe.invoices.list({
			customer: customerId,
			limit,
		});
	}

	/**
	 * Verify webhook signature
	 */
	async verifyWebhookSignature(payload: string | Buffer, signature: string, webhookSecret: string): Promise<Stripe.Event> {
		const stripe = await this.getStripe();
		return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
	}

	/**
	 * Create a product in Stripe
	 */
	async createProduct(name: string, description?: string, metadata?: Record<string, string>): Promise<Stripe.Product> {
		const stripe = await this.getStripe();
		return stripe.products.create({
			name,
			description,
			metadata,
		});
	}

	/**
	 * Create a price in Stripe
	 */
	async createPrice(params: {
		productId: string;
		unitAmount: number;
		currency: string;
		interval: 'day' | 'week' | 'month' | 'year';
		intervalCount?: number;
		metadata?: Record<string, string>;
	}): Promise<Stripe.Price> {
		const stripe = await this.getStripe();
		return stripe.prices.create({
			product: params.productId,
			unit_amount: params.unitAmount,
			currency: params.currency,
			recurring: {
				interval: params.interval,
				interval_count: params.intervalCount || 1,
			},
			metadata: params.metadata,
		});
	}

	/**
	 * Get price by ID
	 */
	async getPrice(priceId: string): Promise<Stripe.Price> {
		const stripe = await this.getStripe();
		return stripe.prices.retrieve(priceId);
	}

	/**
	 * Test connection to Stripe
	 */
	async testConnection(): Promise<boolean> {
		try {
			const stripe = await this.getStripe();
			await stripe.products.list({ limit: 1 });
			return true;
		} catch (error) {
			this.logger.error('Stripe connection test failed', error);
			return false;
		}
	}
}
