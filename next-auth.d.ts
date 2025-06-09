import NextAuth from "next-auth";
import { Role, Permission } from "@/lib/permissions";

declare module "next-auth" {
  interface Session {
    id: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: Role;
      permissions?: Permission[];
    };
  }

  interface JWT {
    id: string;
    role?: Role;
    permissions?: Permission[];
  }

  interface User {
    role?: Role;
  }
}
