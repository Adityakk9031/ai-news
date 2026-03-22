import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/ainews";

export const pool = new Pool({
  connectionString: databaseUrl,
});

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  const result = await pool.query(text, params);
  return { rows: result.rows as T[] };
}
