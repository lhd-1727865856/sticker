import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: number;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      balance: number;
    }
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    balance: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    balance: number;
  }
} 