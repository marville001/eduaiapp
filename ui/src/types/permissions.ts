export interface Permission {
	id: number;
	createdAt: string;
	updatedAt: string;
	deletedAt: null;
	permissionId: string;
	resource: string;
	action: string;
	name: string;
	description: string;
}

export interface Role {
	id: number;
	roleId: string;
	name: string;
	description?: string;
	isSystemRole: boolean;
	isAdminRole: boolean;
	permissions: Permission[];
	createdAt?: string;
	updatedAt?: string;
}