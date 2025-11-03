import { UserRole } from '@/common/enums/user-role.enum';
import { DEFAULT_ADMIN_PERMISSIONS, SYSTEM_PERMISSIONS } from '@/modules/permissions/constants/permissions.constant';
import { Permission } from '@/modules/permissions/entities/permission.entity';
import { Role } from '@/modules/permissions/entities/role.entity';
import { User } from '@/modules/users/entities/user.entity';
import { DataSource } from 'typeorm';

export class PermissionsSeed {
	async run(dataSource: DataSource): Promise<void> {
		try {
			const permissionRepository = dataSource.getRepository(Permission);
			const roleRepository = dataSource.getRepository(Role);
			const userRepository = dataSource.getRepository(User);

			// Create all system permissions
			const permissionsMap = new Map<string, Permission>();
			for (const permDef of SYSTEM_PERMISSIONS) {
				let permission = await permissionRepository.findOne({
					where: {
						resource: permDef.resource,
						action: permDef.action,
					},
				});

				if (!permission) {
					permission = await permissionRepository.save({
						resource: permDef.resource,
						action: permDef.action,
						name: permDef.name,
						description: permDef.description,
					});
					console.log(`  ✓ Created permission: ${permDef.name}`);
				}

				const key = `${permDef.resource}:${permDef.action}`;
				permissionsMap.set(key, permission);
			}

			// Create Super Admin role with all permissions
			let superAdminRole = await roleRepository.findOne({
				where: { name: UserRole.SUPER_ADMIN },
				relations: ['permissions'],
			});

			const allPermissions = await permissionRepository.find();

			if (!superAdminRole) {
				superAdminRole = await roleRepository.save({
					name: UserRole.SUPER_ADMIN,
					description: 'Full system access',
					isSystemRole: true,
					isAdminRole: true,
					permissions: allPermissions,
				});
				console.log(`  ✓ Created role: ${UserRole.SUPER_ADMIN} with ${allPermissions.length} permissions`);
			} else {
				try {
					superAdminRole.permissions = allPermissions;
					await roleRepository.save(superAdminRole);
					console.log(`  ✓ Updated role: ${UserRole.SUPER_ADMIN}`);
				} catch (error) {
					console.error(`❌ Error updating role: ${UserRole.SUPER_ADMIN}:`, error.message);
				}
			}

			// Create Admin role with restricted permissions
			let adminRole = await roleRepository.findOne({
				where: { name: UserRole.ADMIN },
				relations: ['permissions'],
			});

			const adminPermissions = Array.from(permissionsMap.entries())
				.filter(([key]) => DEFAULT_ADMIN_PERMISSIONS.includes(key))
				.map(([_, permission]) => permission);

			if (!adminRole) {
				adminRole = await roleRepository.save({
					name: UserRole.ADMIN,
					description: 'Standard admin access',
					isSystemRole: true,
					isAdminRole: true,
					permissions: adminPermissions,
				});
				console.log(`  ✓ Created role: ${UserRole.ADMIN} with ${adminPermissions.length} permissions`);
			} else {
				// Update permissions if role already exists
				try {
					adminRole.permissions = adminPermissions;
					await roleRepository.save(adminRole);
					console.log(`  ✓ Updated role: ${UserRole.ADMIN}`);
				} catch (error) {
					console.error(`❌ Error updating role: ${UserRole.ADMIN}:`, error.message);
				}
			}

			// Create Teacher role (minimal permissions)
			let teacherRole = await roleRepository.findOne({
				where: { name: UserRole.TEACHER },
				relations: ['permissions'],
			});

			if (!teacherRole) {
				teacherRole = await roleRepository.save({
					name: UserRole.TEACHER,
					description: 'Teacher access',
					isSystemRole: true,
					isAdminRole: false,
					permissions: [],
				});
				console.log(`  ✓ Created role: ${UserRole.TEACHER}`);
			}

			// Create Parent role (minimal permissions)
			let parentRole = await roleRepository.findOne({
				where: { name: UserRole.PARENT },
				relations: ['permissions'],
			});

			if (!parentRole) {
				parentRole = await roleRepository.save({
					name: UserRole.PARENT,
					description: 'Parent access',
					isSystemRole: true,
					isAdminRole: false,
					permissions: [],
				});
				console.log(`  ✓ Created role: ${UserRole.PARENT}`);
			}

			// Update existing users to have role relationships
			console.log('  ⚙️  Updating existing users with roles...');
			const usersWithoutRoles = await userRepository.find({
				where: { roleId: null },
			});

			for (const user of usersWithoutRoles) {
				let roleToAssign: Role | null = null;

				switch (user.role) {
					case UserRole.SUPER_ADMIN:
						roleToAssign = superAdminRole;
						break;
					case UserRole.ADMIN:
						roleToAssign = adminRole;
						break;
					case UserRole.TEACHER:
						roleToAssign = teacherRole;
						break;
					case UserRole.PARENT:
					default:
						roleToAssign = parentRole;
						break;
				}

				if (roleToAssign) {
					user.roleId = roleToAssign.id;
					await userRepository.save(user);
				}
			}

			console.log(`  ✓ Updated ${usersWithoutRoles.length} users with role relationships`);
			console.log('✅ Permissions and roles seeding complete!');
		} catch (error) {
			console.error('❌ Error during permissions and roles seeding:', error.message);
		}
	}
}
