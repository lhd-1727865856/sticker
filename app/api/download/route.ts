import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const prompt = searchParams.get('prompt') || 'sticker';
    
    if (!imageUrl) {
      return NextResponse.json({ error: '缺少图片URL' }, { status: 400 });
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const imageData = await response.arrayBuffer();
    const headers = new Headers();
    headers.set('Content-Type', 'image/png');
    
    // 对中文文件名进行 URL 编码
    const encodedFilename = encodeURIComponent(prompt);
    headers.set(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodedFilename}.png`
    );

    return new NextResponse(imageData, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: '下载失败' },
      { status: 500 }
    );
  }
} 