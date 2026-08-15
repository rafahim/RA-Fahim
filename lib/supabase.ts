import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';
import { env, isSupabaseConfigured } from './env';

/**
 * Browser-safe Supabase client, built with `@supabase/ssr` so the auth
 * session is stored in cookies (not localStorage). That's what lets the
 * session be read by Next.js middleware and Server Components too — the
 * "current recommended" Supabase + Next.js App Router pattern.
 *
 * SECURITY: this client is initialized with the public anonymous key ONLY.
 * Data access is enforced by Supabase Row Level Security (RLS) policies,
 * not by this key being secret. The service-role key must never be passed
 * to a browser client — see `.env.example`, `lib/env.ts`, and the
 * server-only client in `lib/supabase-server.ts`.
 *
 * `supabase` is `null` when the required env vars aren't set (e.g. local
 * dev before `.env.local` is configured), so consumers can render a
 * friendly "not configured" state instead of crashing on import.
 */
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured()
  ? createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey)
  : null;

/**
 * Throws a clear error if code that requires Supabase runs without it
 * being configured, instead of failing later with a confusing null
 * reference error.
 */
export function requireSupabase(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    );
  }
  return supabase;
}
