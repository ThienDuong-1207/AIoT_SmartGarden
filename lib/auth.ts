import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import bcrypt from "bcryptjs";
import UserModel from "@/models/User";
import { dbConnect } from "@/lib/mongodb";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const enableGoogle = Boolean(googleClientId && googleClientSecret);

async function ensureDbConnection() {
  try {
    await dbConnect();
    return true;
  } catch (error) {
    console.error("[auth] Database connection failed", error);
    return false;
  }
}

const providers: Provider[] = [
  ...(enableGoogle
    ? [
        GoogleProvider({
          clientId: googleClientId as string,
          clientSecret: googleClientSecret as string,
        }),
      ]
    : []),
  CredentialsProvider({
    name: "Email Login",
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

      if (!(await ensureDbConnection())) {
        throw new Error("Authentication service is not configured correctly");
      }

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
        throw new Error("Admin account has no password set");
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
];

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  providers,
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

      if (!enableGoogle && account?.provider === "google") {
        return false;
      }

      if (!user.email || !user.name) {
        return false;
      }

      if (!(await ensureDbConnection())) {
        return false;
      }

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

      if (!(await ensureDbConnection())) {
        return token;
      }

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
