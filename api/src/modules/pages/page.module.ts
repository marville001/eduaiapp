import { Module } from '@nestjs/common';
import { PageService } from './page.service';
import { PageController } from './page.controller';
import { PageRepository } from './page.repository';

@Module({
  imports: [],
  controllers: [PageController],
  providers: [PageService, PageRepository],
  exports: [PageService]
})
export class PageModule {}