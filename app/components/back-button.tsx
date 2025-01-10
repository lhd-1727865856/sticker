'use client';

import { useRouter } from 'next/navigation';
import styles from './back-button.module.css';

export default function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()} 
      className={styles.backButton}
      title="返回"
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.backIcon}>
        <path 
          d="M19 12H5M5 12L12 19M5 12L12 5" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      返回
    </button>
  );
} 