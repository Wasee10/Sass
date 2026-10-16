import { Pool } from 'pg';
import { serverConfig } from '@/server/config/env';

let pool;

export function getPostgresPool() {
  if (!pool) {
    const connectionString = serverConfig.database.url;
    if (connectionString && !connectionString.includes('your-database')) {
      pool = new Pool({
        connectionString,
        ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 1500,
        idleTimeoutMillis: 5000,
      });
    }
  }
  return pool;
}

export function withTimeout(promise, ms = 1500) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

export async function query(text, params) {
  const p = getPostgresPool();
  if (!p) {
    return { rows: [] };
  }
  return withTimeout(p.query(text, params), 2000);
}

export default {
  getPostgresPool,
  withTimeout,
  query,
};
