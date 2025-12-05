import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the connection immediately
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL CONNECTED:', process.env.DB_USER, '@', process.env.DB_HOST);
    conn.release();
  } catch (err) {
    console.error('❌ MySQL CONNECTION ERROR ➜', err);
  }
})();

// Generic query function
export async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Optional: get a raw connection if you need transactions
export async function getConnection() {
  return await pool.getConnection();
}

export default pool;
