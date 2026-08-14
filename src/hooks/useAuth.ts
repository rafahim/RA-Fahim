import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import * as authService from '../services/auth.service';
import type { AdminUser, AuthState } from '../types/auth.types';

/**
 * Tracks the current Supabase auth session for the Admin Panel.
 * Subscribes to auth state changes so sign-in/sign-out in one tab (or a
 * token refresh) is reflected immediately everywhere `useAuth` is used.
 */
export function useAuth(): AuthState & {
  signIn: (email: string, password: string) => ReturnType<typeof authService.signIn>;
  signOut: () => ReturnType<typeof authService.signOut>;
} {
  const [state, setState] = useState<AuthState>({ user: null, status: 'idle' });

  useEffect(() => {
    if (!supabase) {
      setState({ user: null, status: 'unauthenticated' });
      return;
    }

    let active = true;
    setState((prev) => ({ ...prev, status: 'loading' }));

    authService.getCurrentUser().then((result) => {
      if (!active) return;
      const user: AdminUser | null = result.error ? null : result.data;
      setState({ user, status: user ? 'authenticated' : 'unauthenticated' });
    });

    // Re-runs on every sign-in, sign-out, and token refresh (including the
    // silent background refresh Supabase performs before expiry, and the
    // forced sign-out it fires when a refresh token is no longer valid).
    // Routing this through getCurrentUser — rather than trusting the
    // session payload directly — re-checks admin_users each time, so a
    // revoked admin is logged out on their next refresh, not just at
    // next full page load.
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      if (!session?.user) {
        setState({ user: null, status: 'unauthenticated' });
        return;
      }

      authService.getCurrentUser().then((result) => {
        if (!active) return;
        const user: AdminUser | null = result.error ? null : result.data;
        setState({ user, status: user ? 'authenticated' : 'unauthenticated' });
      });
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { ...state, signIn: authService.signIn, signOut: authService.signOut };
}
