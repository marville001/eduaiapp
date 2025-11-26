import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '../ai/entities/question.entity';
import { Blog } from '../blogs/entities/blog.entity';
import { UserSubscription } from '../subscriptions/entities/user-subscription.entity';
import { User } from '../users/entities/user.entity';
import { AdminStatsService } from './admin-stats.service';
import { AdminController } from './admin.controller';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			User,
			Blog,
			Question,
			UserSubscription,
		]),
	],
	controllers: [AdminController],
	providers: [AdminStatsService],
	exports: [AdminStatsService],
})
export class AdminModule { }
