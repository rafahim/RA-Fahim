import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';
import { env, isSupabaseConfigured } from './env';

/**
 * Browser-safe Supabase client.
 *
 * SECURITY: this client is initialized with the public anonymous key ONLY.
 * Data access is enforced by Supabase Row Level Security (RLS) policies,
 * not by this key being secret. The service-role key must never be passed
 * to `createClient` here or anywhere else under `src/` — see
 * `.env.example` and `src/lib/env.ts`.
 *
 * `supabase` is `null` when the required env vars aren't set (e.g. local
 * dev before `.env.local` is configured), so consumers can render a
 * friendly "not configured" state instead of crashing on import.
 */
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured()
  ? createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Throws a clear error if code that requires Supabase runs without it
 * being configured, instead of failing later with a confusing null
 * reference error.
 */
export function requireSupabase(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.'
    );
  }
  return supabase;
}
