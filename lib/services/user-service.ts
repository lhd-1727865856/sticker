import { query } from '../db';

export interface User {
  id: number;
  username: string;
  email: string | null;
  github_id: string | null;
  github_username: string | null;
  github_avatar_url: string | null;
  github_access_token: string | null;
  balance: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  username: string;
  email?: string | null;
  github_id?: string;
  github_username?: string;
  github_avatar_url?: string;
  github_access_token?: string;
}

export interface UpdateUserData {
  email?: string | null;
  github_username?: string;
  github_avatar_url?: string;
  github_access_token?: string;
}

export class UserService {
  // 创建用户
  static async createUser(data: CreateUserData): Promise<User> {
    const result = await query(
      `INSERT INTO users (
        username, email, github_id, github_username, github_avatar_url, github_access_token
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        data.username,
        data.email || null,
        data.github_id || null,
        data.github_username || null,
        data.github_avatar_url || null,
        data.github_access_token || null
      ]
    );
    return result.rows[0];
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
} 