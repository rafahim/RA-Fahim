'use client';

import Link from 'next/link';
import {
  FolderKanban,
  CheckCircle,
  Wrench,
  Mail,
  AlertCircle,
  User,
  MessageSquare,
} from 'lucide-react';
import { useDashboardStats } from '../../hooks/useContent';
import { isSupabaseConfigured } from '../../lib/env';
import { Skeleton, ErrorState, EmptyState } from '../../components/ui';

interface StatCard {
  label: string;
  value: number;
  icon: typeof FolderKanban;
  accent: string;
}

interface QuickAction {
  label: string;
  to: string;
  icon: typeof FolderKanban;
}

const quickActions: QuickAction[] = [
  { label: 'Add Project', to: '/admin/projects/new', icon: FolderKanban },
  { label: 'Add Service', to: '/admin/services', icon: Wrench },
  { label: 'Edit About', to: '/admin/about', icon: User },
  { label: 'View Messages', to: '/admin/messages', icon: MessageSquare },
];

export default function DashboardPage() {
  const { data: stats, loading, error, refetch } = useDashboardStats();

  const cards: StatCard[] = [
    {
      label: 'Total Projects',
      value: stats?.totalProjects ?? 0,
      icon: FolderKanban,
      accent: 'text-[#8B7CF6]',
    },
    {
      label: 'Published Projects',
      value: stats?.publishedProjects ?? 0,
      icon: CheckCircle,
      accent: 'text-emerald-400',
    },
    {
      label: 'Total Services',
      value: stats?.totalServices ?? 0,
      icon: Wrench,
      accent: 'text-[#4C8DFF]',
    },
    {
      label: 'Total Messages',
      value: stats?.totalMessages ?? 0,
      icon: Mail,
      accent: 'text-white/70',
    },
    {
      label: 'Unread Messages',
      value: stats?.unreadMessages ?? 0,
      icon: AlertCircle,
      accent: 'text-amber-400',
    },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-medium">Dashboard</h1>
      <p className="mb-8 text-sm text-white/50">Overview of your portfolio content.</p>

      {!isSupabaseConfigured() && (
        <div className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-300">
          Supabase isn&apos;t configured yet, so statistics below are showing as zero. Set{' '}
          <code className="text-yellow-200">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code className="text-yellow-200">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to connect live data.
        </div>
      )}

      {/* Stats */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
              aria-hidden
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-8 w-14" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <ErrorState message={error} onRetry={refetch} className="mb-8" />
      )}

      {!loading && !error && stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map(({ label, value, icon: Icon, accent }) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-white/40">{label}</p>
                <Icon className={`h-4 w-4 ${accent}`} aria-hidden />
              </div>
              <p className="mt-2 text-2xl font-medium">{value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && stats && stats.totalProjects === 0 && stats.totalServices === 0 && (
        <EmptyState
          className="mt-6"
          title="No content yet"
          description="Get started by adding your first project or service using the quick actions below."
        />
      )}

      {/* Quick actions */}
      <h2 className="mb-3 mt-10 text-sm font-medium uppercase tracking-widest text-white/50">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map(({ label, to, icon: Icon }) => (
          <Link
            key={label}
            href={to}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white/80 transition-colors hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4C8DFF]/15 text-[#8B7CF6]">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
