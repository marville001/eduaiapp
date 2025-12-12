import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permission, RequirePermissions } from '@/common/decorators/permissions.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtPayload } from '@/common/interfaces/jwt-payload.interface';
import {
	PermissionAction,
	PermissionResource,
} from '@/modules/permissions/entities/permission.entity';
import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { CreditService } from './credit.service';
import {
	AdminAdjustCreditsDto,
	GetTransactionHistoryDto,
	UpdateCreditThresholdDto,
} from './dto/credits.dto';
import { UserCreditsRepository } from './user-credits.repository';

@Controller('billing')
export class BillingController {
	constructor(
		private readonly creditService: CreditService,
		private readonly userCreditsRepo: UserCreditsRepository,
	) { }

	// ==================== USER CREDIT ENDPOINTS ====================

	/**
	 * Get current user's credit balance
	 */
	@Get('credits/balance')
	@UseGuards(JwtAuthGuard)
	async getBalance(@CurrentUser('user') user: JwtPayload) {
		return await this.creditService.getBalance(user.sub);
	}

	/**
	 * Get current user's transaction history
	 */
	@Get('credits/transactions')
	@UseGuards(JwtAuthGuard)
	async getTransactions(
		@CurrentUser('user') user: JwtPayload,
		@Query() query: GetTransactionHistoryDto,
	) {
		const { transactions, total } = await this.creditService.getTransactionHistory(
			user.sub,
			{
				limit: query.limit,
				offset: query.offset,
				transactionType: query.transactionType,
			},
		);

		return {
			success: true,
			data: transactions,
			meta: {
				total,
				limit: query.limit,
				offset: query.offset,
			},
		};
	}

	/**
	 * Get current user's usage summary for a date range
	 */
	@Get('credits/usage-summary')
	@UseGuards(JwtAuthGuard)
	async getUsageSummary(
		@CurrentUser('user') user: JwtPayload,
		@Query('startDate') startDate: string,
		@Query('endDate') endDate: string,
	) {
		const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		const end = endDate ? new Date(endDate) : new Date();

		return await this.creditService.getUsageSummary(user.sub, start, end);
	}

	/**
	 * Get AI usage breakdown
	 */
	@Get('credits/ai-usage')
	@UseGuards(JwtAuthGuard)
	async getAiUsage(
		@CurrentUser('user') user: JwtPayload,
		@Query('startDate') startDate?: string,
		@Query('endDate') endDate?: string,
	) {
		const start = startDate ? new Date(startDate) : undefined;
		const end = endDate ? new Date(endDate) : undefined;

		const breakdown = await this.creditService.getAiUsageBreakdown(user.sub, start, end);
		return {
			success: true,
			data: breakdown,
		};
	}

	/**
	 * Get daily usage for charts
	 */
	@Get('credits/daily-usage')
	@UseGuards(JwtAuthGuard)
	async getDailyUsage(
		@CurrentUser('user') user: JwtPayload,
		@Query('days', new ParseIntPipe({ optional: true })) days?: number,
	) {
		return await this.creditService.getDailyUsage(user.sub, days || 30);
	}

	/**
	 * Update low credit threshold
	 */
	@Patch('credits/threshold')
	@UseGuards(JwtAuthGuard)
	async updateThreshold(
		@CurrentUser('user') user: JwtPayload,
		@Body() dto: UpdateCreditThresholdDto,
	) {
		const credits = await this.userCreditsRepo.findOrCreate(user.sub);
		credits.lowCreditThreshold = dto.threshold;
		credits.lowCreditNotified = false; // Reset notification flag
		await this.userCreditsRepo.save(credits);

		return {
			success: true,
			message: 'Threshold updated successfully',
		};
	}

	// ==================== ADMIN ENDPOINTS ====================

	/**
	 * Adjust user credits - Admin only
	 */
	@Post('admin/credits/adjust')
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@RequirePermissions(Permission(PermissionResource.BILLING, PermissionAction.UPDATE))
	async adjustUserCredits(
		@CurrentUser('id') adminUserId: number,
		@Body() dto: AdminAdjustCreditsDto,
	) {
		return await this.creditService.adminAdjustCredits(
			dto.userId,
			dto.amount,
			dto.reason,
			adminUserId,
		);
	}

	/**
	 * Get user's credit balance - Admin only
	 */
	@Get('admin/users/:userId/credits')
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@RequirePermissions(Permission(PermissionResource.BILLING, PermissionAction.READ))
	async getUserCredits(@Param('userId', ParseIntPipe) userId: number) {
		return await this.creditService.getBalance(userId);
	}

	/**
	 * Get user's transaction history - Admin only
	 */
	@Get('admin/users/:userId/transactions')
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@RequirePermissions(Permission(PermissionResource.BILLING, PermissionAction.READ))
	async getUserTransactions(
		@Param('userId', ParseIntPipe) userId: number,
		@Query() query: GetTransactionHistoryDto,
	) {
		const { transactions, total } = await this.creditService.getTransactionHistory(
			userId,
			{
				limit: query.limit,
				offset: query.offset,
				transactionType: query.transactionType,
			},
		);

		return {
			success: true,
			data: transactions,
			meta: {
				total,
				limit: query.limit,
				offset: query.offset,
			},
		};
	}

	/**
	 * Get billing statistics - Admin only
	 */
	@Get('admin/statistics')
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@RequirePermissions(Permission(PermissionResource.BILLING, PermissionAction.READ))
	async getStatistics() {
		return await this.creditService.getStatistics();
	}
}
