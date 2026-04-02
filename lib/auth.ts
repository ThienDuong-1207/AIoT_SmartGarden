import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import UserModel from "@/models/User";
import { dbConnect } from "@/lib/mongodb";

const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

if (process.env.NODE_ENV === "production" && !authSecret) {
  throw new Error("Missing auth secret: set NEXTAUTH_SECRET or AUTH_SECRET in production environment.");
}

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  debug: process.env.NODE_ENV === "development",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const normalizedPassword = credentials.password.trim();

        await dbConnect();

        const user = await UserModel.findOne({
          email: { $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
        });
        if (!user) {
          throw new Error("Account not found");
        }

        if (user.status === "banned") {
          throw new Error("Account is currently locked");
        }

        if (!user.password) {
          throw new Error("Account has no password set");
        }

        const passwordValue = String(user.password);
        const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(passwordValue);
        const isPasswordValid = isBcryptHash
          ? await bcrypt.compare(normalizedPassword, passwordValue)
          : normalizedPassword === passwordValue;

        if (!isPasswordValid) {
          throw new Error("Incorrect password");
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
      // Cho phép redirect tới URL cụ thể trong cùng domain
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      // Mặc định sau login → dashboard (middleware sẽ redirect admin sang /admin)
      return `${baseUrl}/dashboard`;
    },
  },
};
