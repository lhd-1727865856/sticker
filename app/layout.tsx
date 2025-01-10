import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NextAuthProvider } from './providers';
import LoginButton from './components/login-button';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '创意贴纸生成器',
  description: '使用 AI 生成独特的贴纸',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <NextAuthProvider>
          <LoginButton />
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
