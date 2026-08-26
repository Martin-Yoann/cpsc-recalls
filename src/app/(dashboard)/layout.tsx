'use client';

// ============================================================
// KOI Recall Platform — Dashboard Layout v4
// ============================================================

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  LayoutDashboard,
  ClipboardList,
  Package,
  User,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

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
      <div className="min-h-[60vh] flex items-center justify-center text-secondary text-sm">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-background text-foreground min-h-[calc(100vh-64px)]">
      <div className="container-content py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-20 space-y-2">
              {/* User info */}
              <div className="p-4 bg-foreground text-white rounded-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-foreground text-sm font-bold">
                    {user?.name?.slice(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{user?.name}</p>
                    <p className="text-xs text-white/70 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <p className="label-eyebrow px-3 mb-2">Dashboard</p>
                <nav className="space-y-1">
                  {SIDEBAR_LINKS.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          isActive
                            ? "bg-brand-light text-brand"
                            : "text-secondary hover:bg-surface-dim hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                        {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 mt-4 border-t border-border">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-secondary hover:text-foreground transition-colors rounded-md hover:bg-surface-dim"
                >
                  <ArrowLeft className="h-4 w-4" />
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
