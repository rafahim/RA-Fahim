import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerConfig } from './env';

/**
 * Verifies that the incoming request carries a valid Supabase session for
 * a user on the `admin_users` allow-list, using the service-role key so
 * the check can't be bypassed by RLS or a stale/forged client claim.
 *
 * Every Route Handler that touches Cloudinary's signed/admin API (upload
 * signatures, deletes) MUST call this first — those endpoints must never
 * be reachable by an unauthenticated or non-admin caller.
 */
export async function requireAdmin(
  request: Request
): Promise<{ ok: true; userId: string } | { ok: false; status: number; message: string }> {
  const authHeader = request.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;

  if (!token) {
    return { ok: false, status: 401, message: 'Missing bearer token.' };
  }

  const { url, serviceRoleKey } = getSupabaseServerConfig();
  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) {
    return { ok: false, status: 401, message: 'Invalid or expired session.' };
  }

  const { data: adminRow, error: adminError } = await admin
    .from('admin_users')
    .select('id')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (adminError || !adminRow) {
    return { ok: false, status: 403, message: 'This account does not have admin access.' };
  }

  return { ok: true, userId: userData.user.id };
}
