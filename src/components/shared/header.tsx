'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X, Search, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout, openAuthDrawer } = useAuth();

  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-surface-elevated/90 backdrop-blur supports-[backdrop-filter]:bg-surface-elevated/80">
      <nav className="container-content flex h-15 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold text-text-primary hover:text-brand-teal transition-colors duration-250"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-teal">
            <Shield className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-lg tracking-tight font-bold">KOI</span>
          <span className="hidden sm:inline text-sm text-text-tertiary font-normal">
            Recall Platform
          </span>
        </Link>

        {/* Desktop Nav + Right Actions (lg+) */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3.5 py-2 text-sm rounded-lg transition-colors duration-250 font-medium',
                pathname === item.href
                  ? 'text-brand-teal bg-blade-resolution-light'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
              )}
            >
              {item.label}
            </Link>
          ))}

          <div className="w-px h-5 bg-border mx-2" />

          <Link
            href="/lookup"
            className="px-3.5 py-2 text-sm rounded-lg transition-colors duration-250 font-medium text-text-secondary hover:text-brand-teal hover:bg-surface-secondary flex items-center gap-1.5"
          >
            <Search className="h-4 w-4" />
            Check Status
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-2 rounded-full hover:ring-2 hover:ring-brand-teal/20 transition-all">
                <Avatar className="h-8 w-8 cursor-pointer">
                  {user?.avatarDataUrl && <AvatarImage src={user.avatarDataUrl} alt={user.name} />}
                  <AvatarFallback className="bg-brand-teal text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                  <p className="text-xs text-text-tertiary">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/dashboard'}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/dashboard/claims'}>
                  <Shield className="mr-2 h-4 w-4" />
                  My Claims
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-status-rejected">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-medium cursor-pointer"
                onClick={() => openAuthDrawer('signin')}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className="bg-brand-teal hover:bg-blade-resolution-dark text-white text-sm font-medium cursor-pointer"
                onClick={() => openAuthDrawer('register')}
              >
                Register
              </Button>
            </div>
          )}
        </div>

        {/* Mobile + Tablet menu button */}
        <div className="flex items-center gap-2 lg:hidden">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Avatar className="h-8 w-8">
                {user?.avatarDataUrl && <AvatarImage src={user.avatarDataUrl} alt={user.name} />}
                <AvatarFallback className="bg-brand-teal text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-sm cursor-pointer"
              onClick={() => openAuthDrawer('signin')}
            >
              Sign In
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-surface-elevated">
          <div className="container-content py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-3 py-2.5 text-sm rounded-lg transition-colors duration-250 font-medium',
                  pathname === item.href
                    ? 'text-brand-teal bg-blade-resolution-light'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/lookup"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg text-text-secondary hover:text-brand-teal hover:bg-surface-secondary font-medium"
            >
              <Search className="h-4 w-4" />
              Check Status
            </Link>
            {isAuthenticated ? (
              <div className="pt-2 space-y-1">
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary font-medium">
                  Dashboard
                </Link>
                <Link href="/dashboard/claims" onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary font-medium">
                  My Claims
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full text-left px-3 py-2.5 text-sm rounded-lg text-status-rejected hover:bg-red-50 font-medium">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-2 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 cursor-pointer"
                  onClick={() => { openAuthDrawer('signin'); setMobileOpen(false); }}
                >
                  Sign In
                </Button>
                <Button
                  className="flex-1 bg-brand-teal hover:bg-blade-resolution-dark text-white cursor-pointer"
                  onClick={() => { openAuthDrawer('register'); setMobileOpen(false); }}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
