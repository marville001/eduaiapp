import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Blog } from '../blogs/entities/blog.entity';
import { Question } from '../ai/entities/question.entity';
import { UserSubscription } from '../subscriptions/entities/user-subscription.entity';
import { AdminController } from './admin.controller';
import { AdminStatsService } from './admin-stats.service';

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
export class AdminModule {}
