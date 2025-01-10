import { NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user-service';
import { EmailService } from '@/lib/services/email-service';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: '请提供邮箱地址' },
        { status: 400 }
      );
    }

    // 获取用户信息
    const user = await UserService.getUserByEmail(email);
    
    if (!user) {
      return NextResponse.json(
        { error: '未找到该邮箱对应的用户' },
        { status: 404 }
      );
    }

    // 如果邮箱已验证，返回错误
    if (user.email_verified) {
      return NextResponse.json(
        { error: '该邮箱已验证' },
        { status: 400 }
      );
    }

    // 检查当前验证码是否过期
    if (user.verification_token && user.verification_token_expires) {
      const now = new Date();
      if (now < user.verification_token_expires) {
        return NextResponse.json(
          { error: '验证邮件仍然有效，请检查您的邮箱' },
          { status: 400 }
        );
      }
    }

    // 生成新的验证令牌并更新数据库
    const { token, email: userEmail } = await UserService.refreshVerificationToken(user.id);

    // 发送新的验证邮件
    await EmailService.sendVerificationEmail(userEmail, token);

    return NextResponse.json({
      message: '验证邮件已重新发送，请查收'
    });
  } catch (error: any) {
    console.error('重新发送验证邮件失败:', error);
    return NextResponse.json(
      { error: error.message || '重新发送验证邮件失败，请重试' },
      { status: 500 }
    );
  }
} 