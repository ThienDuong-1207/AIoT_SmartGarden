import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "customer" | "admin";
      status?: "active" | "banned";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "customer" | "admin";
    status?: "active" | "banned";
    provider?: string;
  }
}
