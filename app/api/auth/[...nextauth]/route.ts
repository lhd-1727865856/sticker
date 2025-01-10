import NextAuth, { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserService } from "@/lib/services/user-service";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("请输入邮箱和密码");
        }

        const user = await UserService.getUserByEmail(credentials.email);

        if (!user) {
          throw new Error("邮箱或密码错误");
        }

        // 检查邮箱是否已验证
        if (!user.email_verified) {
          throw new Error("请先验证您的邮箱后再登录");
        }

        // 检查密码
        if (!user.password_hash) {
          throw new Error("此邮箱使用其他方式注册，请使用相应的登录方式");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isValid) {
          throw new Error("邮箱或密码错误");
        }

        return {
          id: user.id.toString(),
          email: user.email || "",
          name: user.username,
          image: user.github_avatar_url || null,
          balance: user.balance,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.balance = user.balance;
      }

      // 处理余额更新
      if (trigger === "update" && session?.balance) {
        token.balance = session.balance;
      }

      return token;
    },
    async session({ session, token, trigger }) {
      if (token) {
        session.user.id = parseInt(token.id);
        
        // 获取最新余额
        const user = await UserService.getUser(parseInt(token.id));
        if (user) {
          session.user.balance = user.balance;
          token.balance = user.balance; // 同时更新 token 中的余额
        } else {
          session.user.balance = token.balance;
        }
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
