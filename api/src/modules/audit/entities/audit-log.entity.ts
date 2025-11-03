import { AbstractEntity } from '@/database/abstract.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum AuditAction {
	// User actions
	USER_SUSPENDED = 'user_suspended',
	USER_REACTIVATED = 'user_reactivated',
	USER_CREATED = 'user_created',
	USER_UPDATED = 'user_updated',
	USER_DELETED = 'user_deleted',
	USER_ROLE_CHANGED = 'user_role_changed',

	// Paper actions
	PAPER_APPROVED = 'paper_approved',
	PAPER_REJECTED = 'paper_rejected',
	PAPER_SUSPENDED = 'paper_suspended',
	PAPER_TAKEN_DOWN = 'paper_taken_down',
	PAPER_REACTIVATED = 'paper_reactivated',

	// Payout actions
	PAYOUT_APPROVED = 'payout_approved',
	PAYOUT_REJECTED = 'payout_rejected',
	PAYOUT_PROCESSED = 'payout_processed',

	// Report actions
	REPORT_RESOLVED = 'report_resolved',
	REPORT_DISMISSED = 'report_dismissed',

	// Settings actions
	SETTINGS_UPDATED = 'settings_updated',
	CREDIT_PACKAGE_CREATED = 'credit_package_created',
	CREDIT_PACKAGE_UPDATED = 'credit_package_updated',
	CREDIT_PACKAGE_DELETED = 'credit_package_deleted',

	// Admin actions
	ADMIN_CREATED = 'admin_created',
	ADMIN_ROLE_ASSIGNED = 'admin_role_assigned',
	ADMIN_PERMISSIONS_CHANGED = 'admin_permissions_changed',

	// Role and permission actions
	ROLE_CREATED = 'role_created',
	ROLE_UPDATED = 'role_updated',
	ROLE_DELETED = 'role_deleted',
}

export enum AuditTargetType {
	USER = 'user',
	PAPER = 'paper',
	REPORT = 'report',
	PAYOUT = 'payout',
	SETTINGS = 'settings',
	CREDIT_PACKAGE = 'credit_package',
	ROLE = 'role',
	PERMISSION = 'permission',
	ADMIN = 'admin',
}

@Entity('audit_logs')
@Index(['performedBy'])
@Index(['action'])
@Index(['targetType'])
@Index(['createdAt'])
@Index(['id'], { unique: true })
export class AuditLog extends AbstractEntity<AuditLog> {
	@PrimaryGeneratedColumn('uuid', { name: 'audit_id' })
	auditId: string;

	@Column({
		type: 'enum',
		enum: AuditAction,
	})
	action: AuditAction;

	@Column({ name: 'performed_by' })
	performedBy: number;

	@Column({ name: 'performer_name', nullable: true })
	performerName: string;

	@Column({
		type: 'enum',
		enum: AuditTargetType,
	})
	targetType: AuditTargetType;

	@Column({ name: 'target_id', nullable: true })
	targetId: string;

	@Column({ type: 'text' })
	details: string;

	@Column({ name: 'ip_address', nullable: true })
	ipAddress: string;

	@Column({ type: 'jsonb', nullable: true })
	metadata: Record<string, any>;

	// Relations
	@ManyToOne(() => User, { eager: false })
	@JoinColumn({ name: 'performed_by', referencedColumnName: 'id' })
	performer: User;
}
