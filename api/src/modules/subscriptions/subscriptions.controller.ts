import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { JwtPayload } from '@/common/interfaces/jwt-payload.interface';
import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	UseGuards
} from '@nestjs/common';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
	constructor(private readonly subscriptionsService: SubscriptionsService) { }

	/**
	 * Get current user's subscription
	 */
	@Get('current')
	async getCurrentSubscription(@CurrentUser() user: JwtPayload) {
		const userId = user.sub;
		return this.subscriptionsService.getCurrentSubscription(userId);
	}

	/**
	 * Get active subscription
	 */
	@Get('active')
	async getActiveSubscription(@CurrentUser() user: JwtPayload) {
		const userId = user.sub;
		return this.subscriptionsService.getActiveSubscription(userId);
	}

	/**
	 * Get usage statistics
	 */
	@Get('usage')
	async getUsageStatistics(@CurrentUser() user: JwtPayload) {
		const userId = user.sub;
		return this.subscriptionsService.getUsageStatistics(userId);
	}

	/**
	 * Create checkout session for subscription
	 */
	@Post('checkout')
	@HttpCode(HttpStatus.OK)
	async createCheckoutSession(@CurrentUser() user: JwtPayload, @Body() dto: CreateCheckoutSessionDto) {
		const userId = user.sub;
		const userEmail = user.email;
		return this.subscriptionsService.createCheckoutSession(userId, dto, userEmail);
	}

	/**
	 * Cancel subscription
	 */
	@Post('cancel')
	@HttpCode(HttpStatus.OK)
	async cancelSubscription(@CurrentUser() user: JwtPayload, @Body() dto: CancelSubscriptionDto) {
		const userId = user.sub;
		return this.subscriptionsService.cancelSubscription(userId, dto);
	}

	/**
	 * Reactivate subscription
	 */
	@Post('reactivate')
	@HttpCode(HttpStatus.OK)
	async reactivateSubscription(@CurrentUser() user: JwtPayload) {
		const userId = user.sub;
		return this.subscriptionsService.reactivateSubscription(userId);
	}

	/**
	 * Update subscription (upgrade/downgrade)
	 */
	@Post('update')
	@HttpCode(HttpStatus.OK)
	async updateSubscription(@CurrentUser() user: JwtPayload, @Body() dto: UpdateSubscriptionDto) {
		const userId = user.sub;
		return this.subscriptionsService.updateSubscription(userId, dto);
	}

	/**
	 * Get billing portal URL
	 */
	@Get('billing-portal')
	async getBillingPortal(@CurrentUser() user: JwtPayload) {
		const userId = user.sub;
		const url = await this.subscriptionsService.getBillingPortalUrl(userId);
		return { url };
	}

	/**
	 * Check if user can perform action
	 */
	@Get('can/:action')
	async canPerformAction(@CurrentUser() user: JwtPayload, @Param('action') action: 'question' | 'chat' | 'upload') {
		const userId = user.sub;
		const canPerform = await this.subscriptionsService.canPerformAction(userId, action);
		return { canPerform, action };
	}
}
