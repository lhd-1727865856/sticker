'use client';

import { useState } from 'react';
import styles from './recharge-modal.module.css';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RechargeModal({ isOpen, onClose }: RechargeModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2 className={styles.title}>充值说明</h2>
        <div className={styles.qrCodeContainer}>
          <img 
            src="/images/image.png" 
            alt="微信二维码" 
            className={styles.qrCode}
          />
          <p className={styles.qrCodeText}>扫码添加微信</p>
        </div>
        <div className={styles.priceList}>
          <h3>充值价格：</h3>
          <ul>
            <li>10元 = 10次生成</li>
            <li>30元 = 35次生成</li>
            <li>50元 = 65次生成</li>
            <li>100元 = 150次生成</li>
          </ul>
        </div>
        <div className={styles.notice}>
          <p>添加微信后，请备注"贴纸充值"</p>
          <p>客服会在24小时内为您处理充值</p>
        </div>
      </div>
    </div>
  );
} 