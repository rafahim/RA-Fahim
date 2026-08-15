'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Wrench,
  User,
  Mail,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDashboardStats, useWebsiteSettings } from '../hooks/useContent';
import { useToast } from '../components/ui';

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end: boolean;
}

const navItems: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban, end: false },
  { to: '/admin/services', label: 'Services', icon: Wrench, end: false },
  { to: '/admin/about', label: 'About', icon: User, end: false },
  { to: '/admin/contact', label: 'Contact', icon: Mail, end: false },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare, end: false },
  { to: '/admin/settings', label: 'Settings', icon: Settings, end: false },
];

function isActivePath(pathname: string, item: NavItem): boolean {
  return item.end ? pathname === item.to : pathname.startsWith(item.to);
}

interface AdminBrandProps {
  websiteTitle?: string | null;
  logoUrl?: string | null;
  className?: string;
  onNavigate?: () => void;
}

/**
 * The website's own name/logo, shown in the admin shell and linking back
 * to the admin dashboard. Uses next/link so it's a client-side
 * navigation (no full page reload), same as the rest of the admin nav.
 */
function AdminBrand({ websiteTitle, logoUrl, className = '', onNavigate }: AdminBrandProps) {
  return (
    <Link
      href="/admin"
      onClick={onNavigate}
      aria-label="Go to admin dashboard"
      className={`flex min-w-0 items-center gap-2 transition-opacity duration-200 hover:opacity-80 ${className}`}
    >
      {logoUrl ? (
        <img src={logoUrl} alt={websiteTitle || 'Website logo'} className="h-6 w-auto flex-shrink-0 sm:h-7" />
      ) : (
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[#4C8DFF]/20 text-[11px] font-bold text-[#B9AEFF] sm:h-7 sm:w-7">
          {(websiteTitle || 'P').trim().charAt(0).toUpperCase()}
        </span>
      )}
      <span className="truncate text-sm font-semibold text-white">{websiteTitle || 'Portfolio'}</span>
    </Link>
  );
}

function NavLinks({
  onNavigate,
  unreadCount,
  pathname,
}: {
  onNavigate?: () => void;
  unreadCount: number;
  pathname: string;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const { to, label, icon: Icon } = item;
        const isActive = isActivePath(pathname, item);
        return (
          <Link
            key={to}
            href={to}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1">{label}</span>
            {label === 'Messages' && unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4C8DFF] px-1.5 text-[11px] font-medium text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { showSuccess } = useToast();
  const { data: stats } = useDashboardStats();
  const { data: siteSettings } = useWebsiteSettings();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    await signOut();
    showSuccess('Signed out successfully.');
    router.replace('/admin/login');
  }

  const currentLabel = navItems.find((item) => isActivePath(pathname, item))?.label ?? 'Dashboard';

  const unreadCount = stats?.unreadMessages ?? 0;

  return (
    <div className="min-h-screen bg-[#0A0A0D] font-kanit text-white">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col justify-between border-r border-white/10 bg-[#0A0A0D] p-6 lg:flex">
        <div>
          <AdminBrand
            websiteTitle={siteSettings?.websiteTitle}
            logoUrl={siteSettings?.logoUrl}
            className="mb-6"
          />
          <p className="mb-8 text-sm uppercase tracking-widest text-white/50">Admin Panel</p>
          <NavLinks unreadCount={unreadCount} pathname={pathname} />
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
          {user?.email && <p className="truncate text-xs text-white/40">{user.email}</p>}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile nav drawer + backdrop */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative flex h-full w-72 max-w-[80vw] flex-col justify-between border-r border-white/10 bg-[#0A0A0D] p-6 shadow-2xl animate-[slide-in_0.2s_ease-out]">
            <div>
              <div className="mb-6 flex items-center justify-between gap-3">
                <AdminBrand
                  websiteTitle={siteSettings?.websiteTitle}
                  logoUrl={siteSettings?.logoUrl}
                  onNavigate={() => setMobileNavOpen(false)}
                />
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close navigation"
                  className="text-white/60 hover:text-white"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <p className="mb-4 text-sm uppercase tracking-widest text-white/50">Admin Panel</p>
              <NavLinks
                unreadCount={unreadCount}
                pathname={pathname}
                onNavigate={() => setMobileNavOpen(false)}
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
              {user?.email && <p className="truncate text-xs text-white/40">{user.email}</p>}
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top nav */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-[#0A0A0D]/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
              className="-ml-1 rounded-lg p-2 text-white/70 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            <AdminBrand
              websiteTitle={siteSettings?.websiteTitle}
              logoUrl={siteSettings?.logoUrl}
              className="lg:hidden"
            />
            <span className="hidden h-5 w-px bg-white/10 lg:block" aria-hidden />
            <h2 className="truncate text-base font-medium sm:text-lg">{currentLabel}</h2>
          </div>

          <div className="flex items-center gap-4">
            {user?.email && (
              <span className="hidden max-w-[12rem] truncate text-xs text-white/40 sm:inline">
                {user.email}
              </span>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              className="flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/30 hover:text-white lg:hidden"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Sign out
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
