'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './login-button.module.css';

export default function LoginButton() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // 在登录和注册页面隐藏
  if (pathname?.startsWith('/auth/')) {
    return null;
  }

  if (status === 'loading') {
    return (
      <div className={styles.loginButton}>
        <span className={styles.loadingDot}>.</span>
        <span className={styles.loadingDot}>.</span>
        <span className={styles.loadingDot}>.</span>
      </div>
    );
  }

  if (session && session.user) {
    return (
      <div className={styles.userInfo}>
        <div className={styles.userProfile}>
          {session.user.image ? (
            <img 
              src={session.user.image} 
              alt="头像" 
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {session.user.name?.[0] || '?'}
            </div>
          )}
          <span className={styles.userName}>
            {session.user.name}
          </span>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: '/auth/signin' })} 
          className={styles.logoutButton}
        >
          退出
        </button>
      </div>
    );
  }

  return (
    <Link href="/auth/signin" className={styles.loginButton}>
      <svg className={styles.githubIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 15C10.343 15 9 13.657 9 12C9 10.343 10.343 9 12 9C13.657 9 15 10.343 15 12C15 13.657 13.657 15 12 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 17V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 12H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      登录 / 注册
    </Link>
  );
} 