import { NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user-service';
import { EmailService } from '@/lib/services/email-service';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    // 验证输入
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已被注册
    const existingUserByEmail = await UserService.getUserByEmail(email);
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 检查用户名是否已被使用
    const existingUserByUsername = await UserService.getUserByUsername(username);
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: '该用户名已被使用' },
        { status: 400 }
      );
    }

    // 创建用户（包含验证令牌和过期时间）
    const user = await UserService.createUser({
      username,
      email,
      password,
    });

    // 发送验证邮件
    if (user.verification_token) {
      await EmailService.sendVerificationEmail(email, user.verification_token);
    }

    // 移除敏感信息
    const { password_hash, verification_token, ...safeUser } = user;

    return NextResponse.json({
      ...safeUser,
      message: '注册成功！请查收验证邮件以完成注册。'
    });
  } catch (error: any) {
    console.error('注册失败:', error);
    return NextResponse.json(
      { error: error.message || '注册失败，请重试' },
      { status: 500 }
    );
  }
} 