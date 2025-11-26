import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
	publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
	secretKey: process.env.STRIPE_SECRET_KEY,
	webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
	successUrl: process.env.STRIPE_SUCCESS_URL || `${process.env.FRONTEND_URL}/subscription/success`,
	cancelUrl: process.env.STRIPE_CANCEL_URL || `${process.env.FRONTEND_URL}/subscription/cancel`,
	currency: process.env.STRIPE_CURRENCY || 'usd',
}));
