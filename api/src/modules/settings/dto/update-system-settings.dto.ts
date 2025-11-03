import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEmail, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateSystemSettingsDto {
  // General Settings
  @ApiPropertyOptional({ description: 'Platform name' })
  @IsOptional()
  @IsString()
  platformName?: string;

  @ApiPropertyOptional({ description: 'Support email address' })
  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @ApiPropertyOptional({ description: 'Allowed file types for upload', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedFileTypes?: string[];

  // Pricing Settings
  @ApiPropertyOptional({ description: 'Minimum payout amount in KES', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minimumPayout?: number;

  @ApiPropertyOptional({ description: 'Platform commission percentage', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  platformCommission?: number;

  @ApiPropertyOptional({ description: 'Credits per KES for custom credit buying', minimum: 0.01 })
  @IsOptional()
  @Min(0.01)
  @Type(() => Number)
  creditPerShilling?: number;

  @ApiPropertyOptional({ description: 'Enable credit purchase' })
  @IsOptional()
  @IsBoolean()
  allowCreditPurchase?: boolean;

  // Notification Settings
  @ApiPropertyOptional({ description: 'Enable email notifications' })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Enable SMS notifications' })
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Enable admin alerts' })
  @IsOptional()
  @IsBoolean()
  adminAlerts?: boolean;

  // Content Settings
  @ApiPropertyOptional({ description: 'Auto-approve papers without manual review' })
  @IsOptional()
  @IsBoolean()
  autoApproval?: boolean;

  @ApiPropertyOptional({ description: 'Require teacher verification before uploading' })
  @IsOptional()
  @IsBoolean()
  requireVerification?: boolean;

  @ApiPropertyOptional({ description: 'Maximum paper size in MB', minimum: 1, maximum: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  maxPaperSize?: number;

  // Teacher Registration Settings
  @ApiPropertyOptional({ description: 'Teacher registration verification tips text' })
  @IsOptional()
  @IsString()
  teacherRegVerificationTips?: string;

  @ApiPropertyOptional({ description: 'Teacher registration document requirements text' })
  @IsOptional()
  @IsString()
  teacherRegDocumentRequirements?: string;

  @ApiPropertyOptional({ description: 'Teacher registration verification process text' })
  @IsOptional()
  @IsString()
  teacherRegVerificationProcess?: string;

  @ApiPropertyOptional({ description: 'Teacher registration what happens next text' })
  @IsOptional()
  @IsString()
  teacherRegWhatHappensNext?: string;

  @ApiPropertyOptional({ description: 'Teacher registration important notes text' })
  @IsOptional()
  @IsString()
  teacherRegImportantNotes?: string;
}
