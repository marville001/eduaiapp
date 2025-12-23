import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsModule } from '../settings/settings.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { BillingController } from './billing.controller';
import { CreditTransactionRepository } from './credit-transaction.repository';
import { CreditService } from './credit.service';
import { CreditTransaction } from './entities/credit-transaction.entity';
import { UserCredits } from './entities/user-credits.entity';
import { UserCreditsRepository } from './user-credits.repository';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			UserCredits,
			CreditTransaction,
		]),
		SubscriptionsModule, // Required for credit multiplier from user's subscription
		SettingsModule, // Required for AI model token pricing configuration
	],
	controllers: [BillingController],
	providers: [
		CreditService,
		UserCreditsRepository,
		CreditTransactionRepository,
	],
	exports: [
		CreditService,
		UserCreditsRepository,
		CreditTransactionRepository,
	],
})
export class BillingModule { }
