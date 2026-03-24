import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import UserModel from "@/models/User";
import { dbConnect } from "@/lib/mongodb";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Thiếu email hoặc mật khẩu");
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const normalizedPassword = credentials.password.trim();

        await dbConnect();

        const user = await UserModel.findOne({
          email: { $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
        });
        if (!user) {
          throw new Error("Không tìm thấy tài khoản");
        }

        if (user.role !== "admin") {
          throw new Error("Chỉ tài khoản admin mới được đăng nhập theo cách này");
        }

        if (user.status === "banned") {
          throw new Error("Tài khoản đang bị khóa");
        }

        if (!user.password) {
          throw new Error("Tài khoản admin chưa có mật khẩu");
        }

        const passwordValue = String(user.password);
        const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(passwordValue);
        const isPasswordValid = isBcryptHash
          ? await bcrypt.compare(normalizedPassword, passwordValue)
          : normalizedPassword === passwordValue;

        if (!isPasswordValid) {
          throw new Error("Sai mật khẩu");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      if (!user.email || !user.name) {
        return false;
      }

      await dbConnect();

      const existingUser = await UserModel.findOne({ email: user.email });

      if (!existingUser) {
        await UserModel.create({
          name: user.name,
          email: user.email,
          image: user.image,
          role: "customer",
          status: "active",
          provider: "google",
        });
        return true;
      }

      if (existingUser.status === "banned") {
        return false;
      }

      existingUser.name = user.name;
      existingUser.image = user.image;
      await existingUser.save();
      return true;
    },
    async jwt({ token, account }) {
      if (!token.email) {
        return token;
      }

      if (account?.provider) {
        token.provider = account.provider;
      }

      await dbConnect();
      const dbUser = await UserModel.findOne({ email: token.email });
      if (!dbUser) {
        return token;
      }

      token.id = dbUser._id.toString();
      token.role = dbUser.role;
      token.status = dbUser.status;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id || "";
        session.user.role = token.role || "customer";
        session.user.status = token.status || "active";
      }
      return session;
    },
    async redirect({ baseUrl, url }) {
      if (url === "/" || url.includes("/admin")) {
        return `${baseUrl}/admin`;
      }

      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
};
