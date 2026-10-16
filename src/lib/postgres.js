import { Pool } from 'pg';

let pool;

// Resilient in-memory fallback store for user packages
const packageMemoryStore = new Map();

export function getPostgresPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
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

// Timeout helper to prevent hung connections
function withTimeout(promise, ms = 1200) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

export async function saveUserPackageToPostgres({
  userId,
  email,
  fullName = 'Member',
  planId = 'free',
  planName = 'Free Starter',
  price = 0,
  billingInterval = 'month',
  features = [],
}) {
  const timestamp = new Date().toISOString();
  const fallbackRecord = {
    user_id: userId,
    email,
    full_name: fullName,
    plan_id: planId,
    plan_name: planName,
    price: Number(price),
    billing_interval: billingInterval,
    status: 'active',
    features,
    created_at: timestamp,
    updated_at: timestamp,
  };

  // Always keep in memory store for instant <1ms retrieval
  packageMemoryStore.set(userId, fallbackRecord);
  if (email) {
    packageMemoryStore.set(email, fallbackRecord);
  }

  const p = getPostgresPool();
  if (!p) {
    return {
      success: true,
      savedToDatabase: false,
      message: 'PostgreSQL connection string not configured. Saved in server cache.',
      data: fallbackRecord,
    };
  }

  try {
    // 1. Ensure table exists with timeout
    await withTimeout(
      p.query(`
        CREATE TABLE IF NOT EXISTS public.user_packages (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          email TEXT NOT NULL,
          full_name TEXT,
          plan_id TEXT NOT NULL,
          plan_name TEXT NOT NULL,
          price NUMERIC DEFAULT 0,
          billing_interval TEXT DEFAULT 'month',
          status TEXT DEFAULT 'active',
          features JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          CONSTRAINT unique_user_package UNIQUE (user_id)
        );
      `),
      1500
    );

    // 2. Insert or update user package selection in PostgreSQL
    const query = `
      INSERT INTO public.user_packages (
        user_id, email, full_name, plan_id, plan_name, price, billing_interval, status, features, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        plan_id = EXCLUDED.plan_id,
        plan_name = EXCLUDED.plan_name,
        price = EXCLUDED.price,
        billing_interval = EXCLUDED.billing_interval,
        features = EXCLUDED.features,
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      userId,
      email,
      fullName,
      planId,
      planName,
      price,
      billingInterval,
      JSON.stringify(features),
    ];

    const result = await withTimeout(p.query(query, values), 1500);

    return {
      success: true,
      savedToDatabase: true,
      record: result.rows[0],
    };
  } catch (error) {
    // Return gracefully with fallback data
    return {
      success: true,
      savedToDatabase: false,
      error: error.message,
      data: fallbackRecord,
    };
  }
}

export async function getUserPackageFromPostgres(userId) {
  // Check memory store first for immediate response
  const cached = packageMemoryStore.get(userId);

  const p = getPostgresPool();
  if (!p) return cached || null;

  try {
    const result = await withTimeout(
      p.query('SELECT * FROM public.user_packages WHERE user_id = $1 LIMIT 1', [userId]),
      1200
    );
    if (result.rows?.[0]) {
      packageMemoryStore.set(userId, result.rows[0]);
      return result.rows[0];
    }
    return cached || null;
  } catch (error) {
    return cached || null;
  }
}

