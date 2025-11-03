import { UserRole } from '@/common/enums/user-role.enum';
import { PermissionAction, PermissionResource } from '../entities/permission.entity';

export interface PermissionDefinition {
	resource: PermissionResource;
	action: PermissionAction;
	name: string;
	description: string;
}

export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
	// User Management
	{
		resource: PermissionResource.USERS,
		action: PermissionAction.READ,
		name: 'View Users',
		description: 'View list of all users',
	},
	{
		resource: PermissionResource.USERS,
		action: PermissionAction.CREATE,
		name: 'Create Users',
		description: 'Create new user accounts',
	},
	{
		resource: PermissionResource.USERS,
		action: PermissionAction.UPDATE,
		name: 'Update Users',
		description: 'Update user information and status',
	},
	{
		resource: PermissionResource.USERS,
		action: PermissionAction.DELETE,
		name: 'Delete Users',
		description: 'Delete user accounts',
	},

	// Settings
	{
		resource: PermissionResource.SETTINGS,
		action: PermissionAction.READ,
		name: 'View Settings',
		description: 'View system settings',
	},
	{
		resource: PermissionResource.SETTINGS,
		action: PermissionAction.UPDATE,
		name: 'Update Settings',
		description: 'Modify system settings',
	},

	// Reports
	{
		resource: PermissionResource.REPORTS,
		action: PermissionAction.READ,
		name: 'View Reports',
		description: 'View system reports and analytics',
	},
	{
		resource: PermissionResource.REPORTS,
		action: PermissionAction.EXPORT,
		name: 'Export Reports',
		description: 'Export reports and data',
	},
];

// Super Admin has all permissions
export const SUPER_ADMIN_PERMISSIONS = SYSTEM_PERMISSIONS.map(
	(p) => `${p.resource}:${p.action}`,
);

// Default Admin permissions (more restricted)
export const DEFAULT_ADMIN_PERMISSIONS = [
	`${PermissionResource.USERS}:${PermissionAction.READ}`,
	`${PermissionResource.REPORTS}:${PermissionAction.READ}`,
];

// Role name mappings
export const ROLE_NAMES = {
	SUPER_ADMIN: UserRole.SUPER_ADMIN,
	ADMIN: UserRole.ADMIN,
	TEACHER: UserRole.TEACHER,
	PARENT: UserRole.PARENT,
	STUDENT: UserRole.STUDENT,
};
