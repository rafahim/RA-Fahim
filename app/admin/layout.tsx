'use client';

import type { ReactNode } from 'react';
import { ToastProvider } from '../../components/ui';

/**
 * Wraps every /admin/* route in ToastProvider, exactly like AdminRoutes
 * did in the Vite app — any admin page can call useToast() for a
 * success/error notification.
 */
export default function AdminSectionLayout({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
