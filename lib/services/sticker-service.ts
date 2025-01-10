import { query, transaction } from '../db';

interface Sticker {
  id: number;
  user_id: number;
  prompt: string;
  url: string;
  created_at: Date;
}

export class StickerService {
  static async createSticker(userId: number, prompt: string, url: string): Promise<Sticker> {
    return await transaction(async (client) => {
      // 扣除余额
      await client.query(
        'UPDATE users SET balance = balance - 1 WHERE id = $1',
        [userId]
      );

      // 创建贴纸
      const result = await client.query(
        'INSERT INTO stickers (user_id, prompt, url) VALUES ($1, $2, $3) RETURNING *',
        [userId, prompt, url]
      );

      return result.rows[0];
    });
  }

  static async getStickers(limit: number = 10, offset: number = 0): Promise<Sticker[]> {
    const result = await query(
      'SELECT * FROM stickers ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  static async getUserStickers(userId: number, limit: number = 10, offset: number = 0): Promise<Sticker[]> {
    const result = await query(
      'SELECT * FROM stickers WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
    return result.rows;
  }
} 