import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import pg from 'pg';
import 'dotenv/config';

// 1️⃣ Drizzle + postgres-js client for queries
export const db = drizzle(
  postgres(process.env.DATABASE_URL, {
    ssl: { rejectUnauthorized: false },
    max: 10,
    idle_timeout: 30,
  })
);

// 2️⃣ pg.Pool for connect-pg-simple sessions
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export default db;
