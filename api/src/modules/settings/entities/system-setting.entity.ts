import { AbstractEntity } from '@/database/abstract.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('system_settings')
@Index(['id'], { unique: true })
export class SystemSetting extends AbstractEntity<SystemSetting> {
  
  // General Settings
  @Column({ name: 'platform_name', default: 'Teachers Marketplace' })
  platformName: string;

  @Column({ name: 'support_email', default: 'support@teachersmarketplace.com' })
  supportEmail: string;

  // User Signup Settings
  @Column({ name: 'allow_signup', type: 'boolean', default: false })
  allowSignup: boolean;
  
  @Column({ name: 'require_verification', type: 'boolean', default: false })
  requireVerification: boolean;

  // Notification Settings
  @Column({ name: 'email_notifications', type: 'boolean', default: true })
  emailNotifications: boolean;

  @Column({ name: 'sms_notifications', type: 'boolean', default: false })
  smsNotifications: boolean;

  @Column({ name: 'admin_alerts', type: 'boolean', default: true })
  adminAlerts: boolean;
}
