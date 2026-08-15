import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '../types/database.types';
import { env, isSupabaseConfigured } from './env';

/**
 * Server-side Supabase client for use in Server Components, Route
 * Handlers, and Server Actions. Reads/writes the auth cookie via
 * `next/headers`, so it sees the same session the browser client set.
 *
 * Only ever import this from server-only files (no "use client").
 * Uses the public anon key — RLS still applies. For privileged
 * operations that must bypass RLS, see the service-role client used in
 * the `/api/cloudinary/*` route handlers.
 */
export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if middleware is refreshing sessions.
        }
      },
    },
  });
}
