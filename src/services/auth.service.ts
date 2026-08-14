import type { SupabaseClient } from '@supabase/supabase-js';
import { requireSupabase } from '../lib/supabase';
import { ok, fail, toServiceError, type ServiceResult } from '../types/api.types';
import type { AdminUser } from '../types/auth.types';
import type { Database } from '../types/database.types';

/**
 * Thin wrapper around Supabase Auth for the Admin Panel. Admin users are
 * managed as regular Supabase Auth users (invited/created via the
 * Supabase dashboard) — there is no separate custom auth system and no
 * public registration flow.
 *
 * Having a valid Supabase session is not sufficient on its own: every
 * sign-in and session restore also checks the `is_admin()` Postgres
 * function (backed by the `admin_users` allow-list and enforced by RLS on
 * every table). A Supabase Auth account that isn't in `admin_users` is
 * immediately signed out — this keeps the client-side gate consistent
 * with what the database actually allows.
 */

function toAdminUser(user: { id: string; email?: string | null } | null): AdminUser | null {
  if (!user) return null;
  return { id: user.id, email: user.email ?? null };
}

async function checkIsAdmin(client: SupabaseClient<Database>): Promise<boolean> {
  const { data, error } = await client.rpc('is_admin');
  if (error) return false;
  return data === true;
}

export async function signIn(email: string, password: string): Promise<ServiceResult<AdminUser>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) return fail({ message: error.message, code: error.name });

    const isAdmin = await checkIsAdmin(client);
    if (!isAdmin) {
      await client.auth.signOut();
      return fail({
        message: 'This account does not have admin access.',
        code: 'not_admin',
      });
    }

    return ok(toAdminUser(data.user) as AdminUser);
  } catch (err) {
    return fail(toServiceError(err, 'Sign in failed.'));
  }
}

export async function signOut(): Promise<ServiceResult<null>> {
  try {
    const client = requireSupabase();
    const { error } = await client.auth.signOut();
    if (error) return fail({ message: error.message, code: error.name });
    return ok(null);
  } catch (err) {
    return fail(toServiceError(err, 'Sign out failed.'));
  }
}

/**
 * Resolves the current admin session, if any. Returns `ok(null)` (not an
 * error) both when there's no session and when the signed-in Supabase
 * user isn't an admin — in the latter case it also signs them out, so a
 * stale/removed-admin session can never linger client-side.
 */
export async function getCurrentUser(): Promise<ServiceResult<AdminUser | null>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client.auth.getUser();
    if (error) return fail({ message: error.message, code: error.name });
    if (!data.user) return ok(null);

    const isAdmin = await checkIsAdmin(client);
    if (!isAdmin) {
      await client.auth.signOut();
      return ok(null);
    }

    return ok(toAdminUser(data.user));
  } catch (err) {
    return fail(toServiceError(err, 'Could not load the current user.'));
  }
}
