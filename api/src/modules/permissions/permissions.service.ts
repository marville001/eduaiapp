import { UserRole } from '@/common/enums/user-role.enum';
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import {
	DEFAULT_ADMIN_PERMISSIONS,
	SYSTEM_PERMISSIONS,
} from './constants/permissions.constant';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';

@Injectable()
export class PermissionsService {
	constructor(
		@InjectRepository(Permission)
		private permissionsRepository: Repository<Permission>,
		@InjectRepository(Role)
		private rolesRepository: Repository<Role>,
		private readonly entityManager: EntityManager
	) { }

	async seedPermissions(): Promise<void> {
		// Create all system permissions
		for (const permDef of SYSTEM_PERMISSIONS) {
			const exists = await this.permissionsRepository.findOne({
				where: {
					resource: permDef.resource,
					action: permDef.action,
				},
			});

			if (!exists) {
				await this.permissionsRepository.save({
					resource: permDef.resource,
					action: permDef.action,
					name: permDef.name,
					description: permDef.description,
				});
			}
		}
	}

	async seedRoles(): Promise<void> {
		// Create Super Admin role
		let superAdminRole = await this.rolesRepository.findOne({
			where: { name: UserRole.SUPER_ADMIN },
			relations: ['permissions'],
		});

		if (!superAdminRole) {
			const allPermissions = await this.permissionsRepository.find();
			superAdminRole = await this.rolesRepository.save({
				name: UserRole.SUPER_ADMIN,
				description: 'Full system access',
				isSystemRole: true,
				permissions: allPermissions,
			});
		}

		// Create Admin role
		let adminRole = await this.rolesRepository.findOne({
			where: { name: UserRole.ADMIN },
			relations: ['permissions'],
		});

		if (!adminRole) {
			const allPermissions = await this.permissionsRepository.find();
			const adminPermissions = allPermissions.filter((p) => {
				const permissionString = `${p.resource}:${p.action}`;
				return DEFAULT_ADMIN_PERMISSIONS.includes(permissionString);
			});

			adminRole = await this.rolesRepository.save({
				name: UserRole.ADMIN,
				description: 'Standard admin access',
				isSystemRole: true,
				permissions: adminPermissions,
			});
		}

		// Create Teacher role (minimal permissions)
		let teacherRole = await this.rolesRepository.findOne({
			where: { name: UserRole.TEACHER },
			relations: ['permissions'],
		});

		if (!teacherRole) {
			teacherRole = await this.rolesRepository.save({
				name: UserRole.TEACHER,
				description: 'Teacher access',
				isSystemRole: true,
				permissions: [],
			});
		}

		// Create Parent role (minimal permissions)
		let parentRole = await this.rolesRepository.findOne({
			where: { name: UserRole.PARENT },
			relations: ['permissions'],
		});

		if (!parentRole) {
			parentRole = await this.rolesRepository.save({
				name: UserRole.PARENT,
				description: 'Parent access',
				isSystemRole: true,
				permissions: [],
			});
		}
	}

	async getAllPermissions(): Promise<Permission[]> {
		return this.permissionsRepository.find({
			order: { resource: 'ASC', action: 'ASC' },
		});
	}

	async getAllRoles(): Promise<Role[]> {
		return this.rolesRepository.find({
			relations: ['permissions'],
			order: { name: 'ASC' },
		});
	}

	async getRoleById(roleId: string): Promise<Role> {
		const role = await this.rolesRepository.findOne({
			where: { roleId },
			relations: ['permissions'],
		});

		if (!role) {
			throw new NotFoundException('Role not found');
		}

		return role;
	}

	async getRoleByName(name: string): Promise<Role> {
		const role = await this.rolesRepository.findOne({
			where: { name },
			relations: ['permissions'],
		});

		if (!role) {
			throw new NotFoundException('Role not found');
		}

		return role;
	}

	async updateRolePermissions(roleId: string, updateDto: UpdateRolePermissionsDto): Promise<Role> {
		const role = await this.rolesRepository.findOne({
			where: { roleId },
			relations: ['permissions'],
		});

		if (!role) {
			throw new NotFoundException('Role not found');
		}

		if (role.isSystemRole && role.name === UserRole.SUPER_ADMIN) {
			throw new BadRequestException('Cannot modify Super Admin role permissions');
		}

		const permissions = await this.permissionsRepository.find({
			where: { permissionId: In(updateDto.permissionIds) },
		});

		if (permissions.length !== updateDto.permissionIds.length) {
			throw new BadRequestException('Some permissions not found');
		}

		await this.entityManager.transaction(async (manager) => {
			// need to clear existing relations first to avoid duplicates
			await manager.clear("role_permissions");

			role.permissions = permissions;
			await manager.save(role);
		});

		return await this.rolesRepository.findOne({
			where: { roleId },
			relations: ['permissions'],
		});
	}

	async createCustomRole(createRoleDto: CreateRoleDto): Promise<Role> {
		const exists = await this.rolesRepository.findOne({
			where: { name: createRoleDto.name },
		});

		if (exists) {
			throw new ConflictException('Role with this name already exists');
		}

		const permissions = await this.permissionsRepository.find({
			where: { id: In(createRoleDto.permissionIds) },
		});

		if (permissions.length !== createRoleDto.permissionIds.length) {
			throw new BadRequestException('Some permissions not found');
		}

		return this.rolesRepository.save({
			name: createRoleDto.name,
			description: createRoleDto.description,
			isSystemRole: false,
			permissions,
		});
	}

	async deleteRole(roleId: string): Promise<void> {
		const role = await this.rolesRepository.findOne({
			where: { roleId },
		});

		if (!role) {
			throw new NotFoundException('Role not found');
		}

		if (role.isSystemRole) {
			throw new BadRequestException('Cannot delete system role');
		}

		await this.rolesRepository.remove(role);
	}

	async getUserPermissions(roleId: string): Promise<string[]> {
		const role = await this.rolesRepository.findOne({
			where: { roleId },
			relations: ['permissions'],
		});

		if (!role) {
			return [];
		}

		return role.permissions.map((p) => `${p.resource}:${p.action}`);
	}
}
