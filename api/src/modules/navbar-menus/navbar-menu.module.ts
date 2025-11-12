import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavbarMenuService } from './navbar-menu.service';
import { NavbarMenuController } from './navbar-menu.controller';
import { NavbarMenuRepository } from './navbar-menu.repository';
import { NavbarMenu } from './entities/navbar-menu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NavbarMenu])],
  controllers: [NavbarMenuController],
  providers: [NavbarMenuService, NavbarMenuRepository],
  exports: [NavbarMenuService],
})
export class NavbarMenuModule {}