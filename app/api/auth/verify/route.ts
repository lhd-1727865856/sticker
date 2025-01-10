import { NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user-service';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: '缺少验证令牌' },
        { status: 400 }
      );
    }

    const result = await UserService.verifyEmail(token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: result.message });
  } catch (error: any) {
    console.error('验证邮箱失败:', error);
    return NextResponse.json(
      { error: error.message || '验证失败，请重试' },
      { status: 500 }
    );
  }
} 