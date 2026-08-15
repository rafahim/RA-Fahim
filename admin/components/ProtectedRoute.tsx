'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../../components/ui';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Redirects to /admin/login unless there is an authenticated (and
 * admin-verified — see useAuth/auth.service) Supabase session.
 *
 * Next.js middleware already redirects unauthenticated visitors away
 * from /admin/* at the edge (see middleware.ts), so this component
 * mainly guards against a session that *looks* valid but isn't an admin
 * account, and against a session that expires/is revoked mid-visit — in
 * both cases the redirect carries `?reason=expired` so the login page
 * can show a clear message instead of silently bouncing the user.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useAuth();
  const router = useRouter();
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (status === 'authenticated') wasAuthenticated.current = true;
  }, [status]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      const query = wasAuthenticated.current ? '?reason=expired' : '';
      router.replace(`/admin/login${query}`);
    }
  }, [status, router]);

  if (status === 'idle' || status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071B33]">
        <Spinner label="Checking session..." />
      </div>
    );
  }

  return <>{children}</>;
}
