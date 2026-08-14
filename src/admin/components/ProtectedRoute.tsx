import { useEffect, useRef, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../../components/ui';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Redirects to /admin/login unless there is an authenticated (and
 * admin-verified — see useAuth/auth.service) Supabase session.
 *
 * If the session was authenticated earlier in this visit and then drops
 * (expired/revoked refresh token, or an admin's access being revoked),
 * the redirect carries `state.reason: 'expired'` so the login page can
 * show a clear message instead of silently bouncing the user.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useAuth();
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (status === 'authenticated') wasAuthenticated.current = true;
  }, [status]);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071B33]">
        <Spinner label="Checking session..." />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={wasAuthenticated.current ? { reason: 'expired' } : undefined}
      />
    );
  }

  return <>{children}</>;
}
