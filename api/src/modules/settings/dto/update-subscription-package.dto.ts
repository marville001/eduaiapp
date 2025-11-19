import { PartialType } from '@nestjs/mapped-types';
import { CreateSubscriptionPackageDto } from './create-subscription-package.dto';

export class UpdateSubscriptionPackageDto extends PartialType(CreateSubscriptionPackageDto) { }
