'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../signin/page.module.css';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      // 防止重复验证
      if (hasVerified.current) {
        return;
      }
      hasVerified.current = true;

      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setError('无效的验证链接');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '验证失败');
        }

        setStatus('success');
        // 3秒后跳转到登录页
        setTimeout(() => {
          router.push('/auth/signin');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setError(error.message || '验证失败，请重试');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>邮箱验证</h1>
        
        {status === 'verifying' && (
          <div className={styles.message}>
            <p>正在验证您的邮箱...</p>
          </div>
        )}

        {status === 'success' && (
          <div className={styles.success}>
            <p>邮箱验证成功！</p>
            <p>3秒后自动跳转到登录页面...</p>
            <Link href="/auth/signin" className={styles.linkButton}>
              立即登录
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.error}>
            <p>{error}</p>
            <Link href="/auth/signin" className={styles.linkButton}>
              返回登录
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 