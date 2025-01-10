import { NextResponse } from 'next/server';
import { StickerService } from '@/lib/services/sticker-service';

export async function GET() {
  try {
    // 获取前10个贴纸，按创建时间倒序排序
    const stickers = await StickerService.getStickers(10, 0);
    
    return NextResponse.json(stickers);
  } catch (error: any) {
    console.error('获取贴纸列表失败:', error);
    return NextResponse.json(
      { error: error.message || '获取贴纸列表失败' },
      { status: 500 }
    );
  }
} 