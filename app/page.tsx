'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';
import RechargeModal from './components/recharge-modal';

interface Sticker {
  id: number;
  prompt: string;
  url: string;
  created_at: string;
  user_id: number;
}

export default function Home() {
  const { data: session, update: updateSession } = useSession();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showMyStickers, setShowMyStickers] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // 获取贴纸列表
  const fetchStickers = async () => {
    try {
      const url = showMyStickers && session?.user?.id 
        ? `/api/stickers?userId=${session.user.id}`
        : '/api/stickers';
      const response = await fetch(url);
      const data = await response.json();
      setStickers(data);
    } catch (error) {
      console.error('Error fetching stickers:', error);
      setError('加载贴纸列表失败');
    }
  };

  useEffect(() => {
    fetchStickers();
  }, [showMyStickers, session?.user?.id]);

  const handleGenerate = async () => {
    if (!session) {
      setError('请先登录');
      return;
    }

    if (!prompt.trim()) {
      setError('请输入贴纸描述');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '生成贴纸失败');
      }

      const data = await response.json();
      // 生成成功后，刷新贴纸列表和用户余额
      await Promise.all([
        fetchStickers(),
        updateSession({ user: { ...session?.user, balance: undefined }, trigger: 'update' })
      ]);
      setPrompt('');
    } catch (error: any) {
      console.error('Error generating sticker:', error);
      setError(error.message || '生成贴纸失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div className={styles.topBanner}>
          <div className={styles.bannerContent}>
            <span className={styles.emoji}>✨</span>
            <span className={styles.bannerText}>创意无限 · 贴纸工坊</span>
            <span className={styles.emoji}>✨</span>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.inputSection}>
          <h1 className={styles.title}>创意贴纸生成器</h1>
          <p className={styles.subtitle}>
            描述你想要的贴纸 <span className={styles.sparkle}>✨</span> AI 帮你实现！
          </p>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.inputWrapper}>
            <input
              type="text"
              className={styles.input}
              value={prompt}
              onChange={(e) => {
                if (e.target.value.length <= 10) {
                  setPrompt(e.target.value);
                }
              }}
              maxLength={10}
              placeholder="例如：可爱的小猫咪..."
            />
            <button
              className={styles.button}
              onClick={handleGenerate}
              disabled={isLoading || !session}
            >
              {isLoading ? '生成中...' : session ? '生成贴纸' : '请先登录'}
            </button>
          </div>
          {session && (
            <div className={styles.balanceContainer}>
              <p className={styles.balanceInfo}>
                剩余生成次数：<span className={styles.balanceAmount}>{session.user.balance || 0}</span> 次
              </p>
              <button 
                className={styles.rechargeButton}
                onClick={() => setShowRechargeModal(true)}
              >
                充值
              </button>
            </div>
          )}
        </div>

        {session && (
          <div className={styles.filterSection}>
            <button
              className={`${styles.filterButton} ${!showMyStickers ? styles.active : ''}`}
              onClick={() => setShowMyStickers(false)}
            >
              全部贴纸
            </button>
            <button
              className={`${styles.filterButton} ${showMyStickers ? styles.active : ''}`}
              onClick={() => setShowMyStickers(true)}
            >
              我的贴纸
            </button>
          </div>
        )}

        <div className={styles.stickersGrid}>
          {stickers.map((sticker, index) => (
            <div key={sticker.id || index} className={styles.stickerItem}>
              <img
                src={sticker.url}
                alt={sticker.prompt || '生成的贴纸'}
                className={styles.stickerImage}
              />
              <button 
                className={styles.downloadButton}
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const downloadUrl = `/api/download?url=${encodeURIComponent(sticker.url)}&prompt=${encodeURIComponent(sticker.prompt)}`;
                    const downloadLink = document.createElement('a');
                    downloadLink.style.display = 'none';
                    downloadLink.href = downloadUrl;
                    downloadLink.download = `${sticker.prompt}.png`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    setTimeout(() => {
                      document.body.removeChild(downloadLink);
                    }, 100);
                  } catch (error) {
                    console.error('下载失败:', error);
                    alert('下载失败，请重试');
                  }
                }}
                title="下载贴纸"
              >
                <svg className={styles.downloadIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 13L12 16L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 18H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <RechargeModal 
        isOpen={showRechargeModal} 
        onClose={() => setShowRechargeModal(false)} 
      />
    </main>
  );
} 