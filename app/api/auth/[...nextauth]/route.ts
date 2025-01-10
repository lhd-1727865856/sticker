import NextAuth, { AuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { UserService } from '@/lib/services/user-service';

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'github') {
        try {
          // 获取或创建用户
          const existingUser = await UserService.getUserByGithubId(user.id as string);
          
          if (existingUser) {
            // 更新用户信息
            await UserService.updateUser(existingUser.id, {
              github_username: user.name || '',
              github_avatar_url: user.image || '',
              github_access_token: account.access_token,
              email: user.email || null,
            });
          } else {
            // 创建新用户
            await UserService.createUser({
              username: user.name || `user_${user.id}`,
              email: user.email || null,
              github_id: user.id as string,
              github_username: user.name || '',
              github_avatar_url: user.image || '',
              github_access_token: account.access_token,
            });
          }
          return true;
        } catch (error) {
          console.error('Error handling sign in:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        try {
          const dbUser = await UserService.getUserByGithubId(token.sub as string);
          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.balance = dbUser.balance;
          }
        } catch (error) {
          console.error('Error loading user session:', error);
        }
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 