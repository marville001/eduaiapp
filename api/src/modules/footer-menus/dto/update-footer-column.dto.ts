import { PartialType } from '@nestjs/mapped-types';
import { CreateFooterColumnDto } from './create-footer-column.dto';

export class UpdateFooterColumnDto extends PartialType(CreateFooterColumnDto) { }