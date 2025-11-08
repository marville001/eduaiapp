
import { Role } from './permissions';

export interface Teacher {
	id: number;
	// Add other teacher properties as needed
}

export interface User {
	id: number;
	createdAt: string;
	avatarUrl?: string;
	updatedAt: string;
	deletedAt: null;
	userId: string;
	roleId: number;
	email: string;
	firstName: string;
	lastName: string;
	phone: null;
	role: string;
	status: string;
	isAdminUser: boolean;
	phoneVerified: boolean;
	emailVerified: boolean;
	emailVerificationToken: null;
	emailVerificationExpires: null;
	resetPasswordToken: null;
	resetPasswordExpires: null;
	phoneVerificationToken: null;
	phoneVerificationExpires: null;
	suspensionReason: null;
	lastLoginAt: null;
	teacherProfile: null;
	userRole: Role;
	teacherProfile?: Teacher;
}
