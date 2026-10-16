import { getPostgresPool, withTimeout } from '@/server/db/postgres';

// Resilient in-memory fallback store for user packages
const packageMemoryStore = new Map();

/**
 * Persists a user's subscription package choice to PostgreSQL table public.user_packages
 * @param {Object} params
 */
export async function saveUserPackage({
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
  const record = {
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
  packageMemoryStore.set(userId, record);
  if (email) {
    packageMemoryStore.set(email, record);
  }

  const p = getPostgresPool();
  if (!p) {
    return {
      success: true,
      savedToDatabase: false,
      message: 'PostgreSQL connection not configured. Saved in server cache.',
      data: record,
    };
  }

  try {
    // 1. Ensure table exists
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

    // 2. Upsert user package selection
    const queryText = `
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

    const result = await withTimeout(p.query(queryText, values), 1500);

    return {
      success: true,
      savedToDatabase: true,
      record: result.rows[0],
    };
  } catch (error) {
    return {
      success: true,
      savedToDatabase: false,
      error: error.message,
      data: record,
    };
  }
}

/**
 * Retrieves the current package for a given user ID
 * @param {string} userId
 */
export async function getUserPackage(userId) {
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

export default {
  saveUserPackage,
  getUserPackage,
};
