import { query } from '../db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface User {
  id: number;
  username: string;
  email: string | null;
  password_hash: string | null;
  github_id: string | null;
  github_username: string | null;
  github_avatar_url: string | null;
  github_access_token: string | null;
  email_verified: boolean;
  verification_token: string | null;
  verification_token_expires: Date | null;
  balance: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  username: string;
  email?: string | null;
  password?: string | null;
  github_id?: string;
  github_username?: string;
  github_avatar_url?: string;
  github_access_token?: string;
}

export interface UpdateUserData {
  email?: string | null;
  password?: string | null;
  github_username?: string;
  github_avatar_url?: string;
  github_access_token?: string;
}

export class UserService {
  // 生成验证令牌
  private static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // 创建用户
  static async createUser(data: CreateUserData): Promise<User> {
    let password_hash = null;
    if (data.password) {
      password_hash = await bcrypt.hash(data.password, 10);
    }

    // 生成验证令牌和过期时间（仅当提供了邮箱时）
    let verificationToken = null;
    let tokenExpires = null;
    
    if (data.email) {
      verificationToken = this.generateVerificationToken();
      tokenExpires = new Date();
      tokenExpires.setMinutes(tokenExpires.getMinutes() + 30); // 30分钟后过期
    }

    const result = await query(
      `INSERT INTO users (
        username, email, password_hash, github_id, github_username, 
        github_avatar_url, github_access_token, verification_token, 
        verification_token_expires
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        data.username,
        data.email || null,
        password_hash,
        data.github_id || null,
        data.github_username || null,
        data.github_avatar_url || null,
        data.github_access_token || null,
        verificationToken,
        tokenExpires
      ]
    );
    return result.rows[0];
  }

  // 验证邮箱
  static async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    // 首先检查令牌是否存在且未过期
    const checkResult = await query(
      `SELECT * FROM users 
       WHERE verification_token = $1`,
      [token]
    );
    console.log(checkResult.rows)
    if (checkResult.rows.length === 0) {
      return {
        success: false,
        message: '无效的验证链接'
      };
    }

    // 检查令牌是否过期
    if (checkResult.rows[0].verification_token_expires <= new Date()) {
      return {
        success: false,
        message: '验证链接已过期，请重新发送验证邮件'
      };
    }

    // 如果邮箱已经验证过了
    if (checkResult.rows[0].email_verified) {
      return {
        success: false,
        message: '该邮箱已经验证过了'
      };
    }

    // 更新用户验证状态
    const result = await query(
      `UPDATE users 
       SET email_verified = TRUE, 
           verification_token = NULL, 
           verification_token_expires = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE verification_token = $1 
       AND verification_token_expires > CURRENT_TIMESTAMP
       AND email_verified = FALSE
       RETURNING *`,
      [token]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        message: '验证失败，请重试'
      };
    }

    return {
      success: true,
      message: '邮箱验证成功'
    };
  }

  // 重新发送验证邮件
  static async refreshVerificationToken(userId: number): Promise<{ token: string; email: string }> {
    // 生成新的验证令牌
    const verificationToken = this.generateVerificationToken();
    const tokenExpires = new Date();
    tokenExpires.setMinutes(tokenExpires.getMinutes() + 30); // 30分钟后过期

    // 更新数据库中的验证令牌和过期时间
    const result = await query(
      `UPDATE users 
       SET verification_token = $1,
           verification_token_expires = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 
       AND email_verified = FALSE
       AND email IS NOT NULL
       RETURNING email, verification_token`,
      [verificationToken, tokenExpires, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('用户不存在或邮箱已验证');
    }

    if (!result.rows[0].email) {
      throw new Error('用户邮箱不存在');
    }

    return {
      token: result.rows[0].verification_token,
      email: result.rows[0].email
    };
  }

  // 更新用户信息
  static async updateUser(userId: number, data: UpdateUserData): Promise<User> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.email !== undefined) {
      updates.push(`email = $${paramCount}`);
      values.push(data.email);
      paramCount++;
    }
    if (data.password !== undefined) {
      const password_hash = await bcrypt.hash(data.password, 10);
      updates.push(`password_hash = $${paramCount}`);
      values.push(password_hash);
      paramCount++;
    }
    if (data.github_username !== undefined) {
      updates.push(`github_username = $${paramCount}`);
      values.push(data.github_username);
      paramCount++;
    }
    if (data.github_avatar_url !== undefined) {
      updates.push(`github_avatar_url = $${paramCount}`);
      values.push(data.github_avatar_url);
      paramCount++;
    }
    if (data.github_access_token !== undefined) {
      updates.push(`github_access_token = $${paramCount}`);
      values.push(data.github_access_token);
      paramCount++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      [...values, userId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('用户不存在');
    }
    
    return result.rows[0];
  }

  // 获取用户信息
  static async getUser(userId: number): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  // 通过用户名获取用户
  static async getUserByUsername(username: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  }

  // 通过 GitHub ID 获取用户
  static async getUserByGithubId(githubId: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE github_id = $1',
      [githubId]
    );
    return result.rows[0] || null;
  }

  // 更新用户余额
  static async updateBalance(userId: number, amount: number): Promise<User> {
    const result = await query(
      'UPDATE users SET balance = balance + $2 WHERE id = $1 RETURNING *',
      [userId, amount]
    );
    
    if (result.rows.length === 0) {
      throw new Error('用户不存在');
    }
    
    return result.rows[0];
  }

  // 获取用户余额
  static async getBalance(userId: number): Promise<number> {
    const result = await query(
      'SELECT balance FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('用户不存在');
    }
    
    return result.rows[0].balance;
  }

  // 通过邮箱获取用户
  static async getUserByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }
} 