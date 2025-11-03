import { UserStatus } from '@/common/enums/user-status.enum';
import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../../modules/users/entities/user.entity';

export class InitialUsersSeed {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    console.log('🌱 Seeding initial users...');

    // Define initial users
    const initialUsers: Partial<User>[] = [
      {
        firstName: 'Super',
        lastName: 'Martin',
        role: UserRole.SUPER_ADMIN,
        email: 'mwangimartin1904@gmail.com',
        emailVerified: true,
        password: 'P@ssw0rd123',
        isAdminUser: true,
        status: UserStatus.ACTIVE,
        phone: '0700207054',
        phoneVerified: true,
      },
    ];

    // Process each user
    for (const userData of initialUsers) {
      const existingUser = await userRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        // Create user
        const user = userRepository.create({
          ...userData,
          password: hashedPassword,
        });

        await userRepository.save(user);
        console.log(`✅ Created ${userData.role}: ${userData.email}`);
      } else {
        console.log(`⏭️  User already exists: ${userData.email}`);
      }
    }

    console.log('🎉 Initial users seeding completed!');
  }
}