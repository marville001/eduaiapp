import { PartialType } from '@nestjs/swagger';
import { CreateNavbarMenuDto } from './create-navbar-menu.dto';

export class UpdateNavbarMenuDto extends PartialType(CreateNavbarMenuDto) {}