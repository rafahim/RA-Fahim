import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env, isSupabaseConfigured } from './lib/env';

/**
 * Runs on every request. Two jobs:
 *
 * 1. Refresh the Supabase auth cookie (required so server components and
 *    route handlers see an up-to-date session — this is the standard
 *    `@supabase/ssr` middleware pattern).
 * 2. Redirect unauthenticated visitors away from `/admin/*` (except the
 *    login page itself) before any admin UI/code ships to them.
 *
 * This is a coarse, session-presence check only — it does NOT verify
 * admin_users membership (that requires a database round trip, which the
 * edge middleware runtime keeps cheap by avoiding). The fine-grained
 * "is this Supabase user actually an admin" check still happens
 * client-side via `useAuth`/`auth.service.ts` (and again, authoritatively,
 * server-side in `/api/cloudinary/*` via the service-role key) — so a
 * non-admin who is merely logged in still can't reach real admin data or
 * privileged operations, they just briefly see the shell before being
 * signed out and redirected.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/admin/login';

  if (!isSupabaseConfigured()) {
    return response;
  }

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminRoute && !isLoginRoute && !user) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('reason', 'expired');
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
