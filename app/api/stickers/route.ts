import { NextResponse } from 'next/server';
import { StickerService } from '@/lib/services/sticker-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // 获取贴纸列表，如果有userId则获取用户的贴纸
    const stickers = userId 
      ? await StickerService.getUserStickers(parseInt(userId), 20, 0)
      : await StickerService.getStickers(20, 0);
    
    return NextResponse.json(stickers);
  } catch (error: any) {
    console.error('获取贴纸列表失败:', error);
    return NextResponse.json(
      { error: error.message || '获取贴纸列表失败' },
      { status: 500 }
    );
  }
} 