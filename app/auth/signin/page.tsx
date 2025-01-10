'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  // 检查是否是从注册页面跳转来的
  const registered = searchParams.get('registered');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResendSuccess('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // 登录成功，跳转到首页
      router.push('/');
      router.refresh();
    } catch (error: any) {
      setError(error.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setError('请输入邮箱地址');
      return;
    }

    setResendLoading(true);
    setError('');
    setResendSuccess('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setResendSuccess(data.message);
    } catch (error: any) {
      setError(error.message || '重新发送验证邮件失败，请重试');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGitHubSignIn = () => {
    signIn('github', { callbackUrl: '/' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isVerificationError = error?.includes('请先验证您的邮箱');

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>登录</h1>

        {registered && (
          <div className={styles.success}>
            注册成功！请使用您的邮箱和密码登录。
          </div>
        )}

        {resendSuccess && (
          <div className={styles.success}>
            {resendSuccess}
          </div>
        )}
        
        {error && (
          <div className={styles.error}>
            {error}
            {isVerificationError && (
              <button
                onClick={handleResendVerification}
                className={styles.resendButton}
                disabled={resendLoading}
              >
                {resendLoading ? '发送中...' : '重新发送验证邮件'}
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">邮箱</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              placeholder="请输入邮箱"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              placeholder="请输入密码"
              className={styles.input}
            />
          </div>

          <button 
            type="submit" 
            className={styles.button}
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>或</span>
        </div>

        <div className={styles.providers}>
          <button 
            onClick={handleGitHubSignIn}
            className={styles.providerButton}
            type="button"
          >
            使用 GitHub 登录
          </button>
        </div>

        <div className={styles.links}>
          <Link href="/auth/register" className={styles.link}>
            没有账号？立即注册
          </Link>
        </div>
      </div>
    </div>
  );
} 