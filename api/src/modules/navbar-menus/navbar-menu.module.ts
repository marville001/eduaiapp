import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavbarMenu } from './entities/navbar-menu.entity';
import { NavbarMenuController } from './navbar-menu.controller';
import { NavbarMenuRepository } from './navbar-menu.repository';
import { NavbarMenuService } from './navbar-menu.service';

@Module({
	imports: [TypeOrmModule.forFeature([NavbarMenu])],
	controllers: [NavbarMenuController],
	providers: [NavbarMenuService, NavbarMenuRepository],
	exports: [NavbarMenuService],
})
export class NavbarMenuModule { }