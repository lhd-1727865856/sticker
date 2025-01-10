import { Pool } from 'pg';

// 数据库配置
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DATABASE,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 查询包装函数
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('执行查询', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('查询错误', { text, error });
    throw error;
  }
}

// 获取单个连接
export async function getClient() {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = () => {
    client.release();
  };
  return { query, release };
}

// 事务包装函数
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// 健康检查
export async function checkConnection() {
  try {
    const result = await query('SELECT NOW()');
    return result.rows[0];
  } catch (error) {
    console.error('数据库连接错误:', error);
    throw error;
  }
} 