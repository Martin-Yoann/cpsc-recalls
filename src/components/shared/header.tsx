"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Menu, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Check Status", href: "/lookup" },
  { label: "File Claim", href: "/recalls/music-lollipop-demo-2026" },
  { label: "FAQ", href: "/faq" },
];

function NavItem({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center px-1 py-2 text-[15px] font-medium transition-all duration-300",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}

      {/* Hover / Active 下划线 */}
      <span
        className={cn(
          "absolute bottom-0 left-0 h-[2px] rounded-full",
          "bg-foreground transition-all duration-300 ease-out",
          active
            ? "w-full opacity-100"
            : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100",
        )}
      />
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout, openAuthDrawer } = useAuth();

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-border">
      <nav className="container-content flex h-[64px] items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center bg-foreground text-white rounded-md">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[16px] font-bold tracking-tight text-foreground">
              KOI Recall
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 lg:flex">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={`${item.href}-${item.label}`}
              {...item}
              active={pathname === item.href}
            />
          ))}
        </div>

        {/* Right side: CTA + auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/recalls/music-lollipop-demo-2026"
                className="btn-brand hidden sm:inline-flex"
              >
                File a Claim
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
                  <span className="inline-flex items-center gap-2 border border-border bg-white px-2 py-1.5 rounded-md hover:border-foreground/40 transition-colors">
                    <Avatar className="h-7 w-7 rounded-full">
                      {user?.avatarDataUrl && (
                        <AvatarImage
                          src={user.avatarDataUrl}
                          alt={user.name || "User avatar"}
                          className="rounded-full"
                        />
                      )}
                      <AvatarFallback className="rounded-full bg-foreground text-xs font-semibold text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-3.5 w-3.5 text-secondary" />
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-50 h-30 border border-border bg-white rounded-md shadow-lg"
                >
                  <DropdownMenuItem
                    onClick={() => setMobileOpen(false)}
                    className="hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 h-8"
                  >
                    <Link href="/dashboard" className="block w-full">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setMobileOpen(false)}
                    className="hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 h-8"
                  >
                    <Link href="/dashboard/claims" className="block w-full">
                      My Claims
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="h-9 text-brand focus:text-brand cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                onClick={() => openAuthDrawer("signin")}
                className=" h-9 w-30"
                style={{
                  backgroundColor: "#ffffff",
                  color: "black",
                  border: "1px solid black",
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthDrawer("register")}
                className=" h-9 w-30"
                style={{ backgroundColor: "#EA0D2A", color: "#ffffff" }}
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9 rounded-md text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-white lg:hidden">
          <div className="container-content py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block py-2.5 text-[15px] font-medium",
                  pathname === item.href ? "text-foreground" : "text-secondary",
                )}
              >
                {item.label}
              </Link>
            ))}

            <div className="pt-3 mt-2 border-t border-border space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block py-2 text-sm font-medium text-foreground"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="block w-full text-left py-2 text-sm font-medium text-brand"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      openAuthDrawer("signin");
                      setMobileOpen(false);
                    }}
                    className="btn-outline justify-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      openAuthDrawer("register");
                      setMobileOpen(false);
                    }}
                    className="btn-brand justify-center"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
