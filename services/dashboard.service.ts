import { requireSupabase } from '../lib/supabase';
import { ok, fail, toServiceError, type ServiceResult } from '../types/api.types';

export interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  totalServices: number;
  totalMessages: number;
  unreadMessages: number;
}

/**
 * Pulls admin dashboard counters directly from Supabase using
 * `count: 'exact', head: true` queries — no rows are transferred, only
 * the count, so this stays cheap even as tables grow.
 */
export async function fetchDashboardStats(): Promise<ServiceResult<DashboardStats>> {
  try {
    const client = requireSupabase();

    const [totalProjects, publishedProjects, totalServices, totalMessages, unreadMessages] =
      await Promise.all([
        client.from('projects').select('*', { count: 'exact', head: true }),
        client
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published'),
        client.from('services').select('*', { count: 'exact', head: true }),
        client.from('messages').select('*', { count: 'exact', head: true }),
        client.from('messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
      ]);

    const results = [
      totalProjects,
      publishedProjects,
      totalServices,
      totalMessages,
      unreadMessages,
    ];
    const firstError = results.find((r) => r.error)?.error;
    if (firstError) return fail({ message: firstError.message, code: firstError.code });

    return ok({
      totalProjects: totalProjects.count ?? 0,
      publishedProjects: publishedProjects.count ?? 0,
      totalServices: totalServices.count ?? 0,
      totalMessages: totalMessages.count ?? 0,
      unreadMessages: unreadMessages.count ?? 0,
    });
  } catch (err) {
    return fail(toServiceError(err, 'Could not load dashboard statistics.'));
  }
}
