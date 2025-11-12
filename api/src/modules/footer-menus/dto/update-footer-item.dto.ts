import { PartialType } from '@nestjs/mapped-types';
import { CreateFooterItemDto } from './create-footer-item.dto';

export class UpdateFooterItemDto extends PartialType(CreateFooterItemDto) { }