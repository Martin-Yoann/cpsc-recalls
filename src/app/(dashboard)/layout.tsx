'use client';

// ============================================================
// KOI Recall Platform — Dashboard Layout
// Protected: redirects to /login if not authenticated
// ============================================================

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  LayoutDashboard,
  ClipboardList,
  Package,
  User,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const SIDEBAR_LINKS = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Claims', href: '/dashboard/claims', icon: ClipboardList },
  { label: 'Linked Orders', href: '/dashboard/orders', icon: Package },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-text-tertiary">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-3.75rem)] bg-surface-primary">
      <div className="container-content py-6 sm:py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24 space-y-1">
              {/* User info */}
              <div className="mb-4 border border-border border-l-4 border-l-brand-teal bg-surface-elevated px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-teal text-white text-sm font-bold">
                    {user?.name?.slice(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">{user?.name}</p>
                    <p className="text-xs text-text-tertiary truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Nav */}
              {SIDEBAR_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                      isActive
                        ? 'border-l-brand-teal bg-brand-teal text-white'
                        : 'border-l-transparent text-text-secondary hover:border-l-border hover:bg-surface-elevated hover:text-text-primary'
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {link.label}
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </Link>
                );
              })}

              <div className="pt-4 mt-4 border-t border-border">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <Shield className="h-4.5 w-4.5" />
                  Back to Home
                </Link>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
