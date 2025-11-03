import { User } from "next-auth";
import "next-auth/jwt";

type UserId = string;

declare module "next-auth/jwt" {
  interface JWT {
    id: UserId;
    userId?: string;
    accessToken?: string;
    refreshToken?: string;
    role?: string;
  }
}

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: User & {
      id: UserId;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      isAdminUser?: boolean;
      userId?: string;
    };
  }
}