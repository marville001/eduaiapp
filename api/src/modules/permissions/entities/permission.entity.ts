import { AbstractEntity } from '@/database/abstract.entity';
import { Column, Entity, Index, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.entity';

export enum PermissionResource {
	USERS = 'users',
	SETTINGS = 'settings',
	AI_MODELS = 'ai_models',
	QUESTIONS = 'questions',
	REPORTS = 'reports',
}

export enum PermissionAction {
	CREATE = 'create',
	READ = 'read',
	UPDATE = 'update',
	DELETE = 'delete',
	SUSPEND = 'suspend',
	EXPORT = 'export',
	VIEW_SENSITIVE = 'view_sensitive',
}

@Entity('permissions')
@Index(['resource', 'action'], { unique: true })
@Index(['id'], { unique: true })
export class Permission extends AbstractEntity<Permission> {
	@PrimaryGeneratedColumn('uuid')
	permissionId: string;

	@Column({
		type: 'enum',
		enum: PermissionResource,
	})
	resource: PermissionResource;

	@Column({
		type: 'enum',
		enum: PermissionAction,
	})
	action: PermissionAction;

	@Column()
	name: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@ManyToMany(() => Role, (role) => role.permissions)
	roles: Role[];
}
