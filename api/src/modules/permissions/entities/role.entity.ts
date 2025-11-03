import { AbstractEntity } from '@/database/abstract.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Column, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Permission } from './permission.entity';

@Entity('roles')
@Index(['name'], { unique: true })
@Index(['id'], { unique: true })
export class Role extends AbstractEntity<Role> {
	@PrimaryGeneratedColumn('uuid')
	roleId: string;

	@Column({ unique: true })
	name: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@Column({ name: 'is_system_role', default: false })
	isSystemRole: boolean; // Prevents deletion of SUPER_ADMIN, ADMIN

	@Column({ name: 'is_admin_role', default: true })
	isAdminRole: boolean;

	@ManyToMany(() => Permission, (permission) => permission.roles, { cascade: true, eager: true })
	@JoinTable({
		name: 'role_permissions',
		joinColumn: { name: 'role_id', referencedColumnName: 'id' },
		inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
	})
	permissions: Permission[];

	@OneToMany(() => User, (user) => user.role)
	users: User[];
}
