"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Candy, ChevronDown, Menu, Search, Sparkles, X } from "lucide-react";
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
  { label: "Home", href: "/", icon: "🍭" },
  { label: "Lookup", href: "/lookup", icon: "🍬" },
  {
    label: "File Claim",
    href: "/recalls/music-lollipop-demo-2026",
    icon: "🍫",
  },
  { label: "My Claims", href: "/claims", icon: "🍓" },
  { label: "About", href: "/faq", icon: "✨" },
];

function NavItem({
  href,
  label,
  icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      data-active={active}
      className={cn(
        "candy-underline inline-flex items-center gap-1.5 px-2 py-2 text-[15px] font-semibold text-[#4A2C2A] transition-colors duration-200 hover:text-[#FF6B8A] focus-visible:text-[#FF6B8A]",
        active && "text-[#FF6B8A]",
      )}
    >
      <span className="text-[14px] leading-none">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout, openAuthDrawer } = useAuth();

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/60 bg-gradient-to-r from-white/80 via-[#FFF5F0]/85 to-white/80 backdrop-blur-xl">
      <nav className="container-content flex h-[72px] items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3 text-[#4A2C2A] transition-transform duration-200 hover:scale-[1.01]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B8A] via-[#FFB07C] to-[#F9E076] text-lg shadow-[0_10px_24px_rgba(255,107,138,0.22)] ring-4 ring-white/70">
            <Candy className="h-5 w-5 text-white" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-[family-name:var(--font-fredoka)] text-[18px] tracking-tight text-[#4A2C2A]">
              KOI Recall
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B46B78]">
              Music Lollipop Safety Recall
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={`${item.href}-${item.label}`}
              {...item}
              active={pathname === item.href}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full outline-none transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[#FF6B8A]/30">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#F4C6B9] bg-white/80 px-2 py-1.5 pr-3 shadow-sm">
                  <Avatar className="h-8 w-8">
                    {user?.avatarDataUrl && (
                      <AvatarImage src={user.avatarDataUrl} alt={user.name} />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-[#FF6B8A] to-[#C9A9E6] text-xs font-bold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-[#B46B78]" />
                </span>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 rounded-2xl border-[#F4C6B9] bg-white/95 backdrop-blur-xl"
              >
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-[#4A2C2A]">
                    {user?.name}
                  </p>
                  <p className="text-xs text-[#8B6B67]">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    window.location.href = "/dashboard";
                  }}
                  className="cursor-pointer rounded-xl"
                >
                  <Sparkles className="h-4 w-4 text-[#FF6B8A]" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    window.location.href = "/dashboard/claims";
                  }}
                  className="cursor-pointer rounded-xl"
                >
                  <Search className="h-4 w-4 text-[#7BC8A4]" />
                  My Claims
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer rounded-xl text-[#B54708] focus:text-[#B54708]"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-3 sm:flex">
              {/* Sign In 按钮：线框款，Hover时背景填充并上浮 */}
              <Button
                variant="outline"
                className="h-10 w-30 rounded-full border border-[#FF8DA1] bg-transparent px-6 font-medium text-[#FF8DA1] shadow-none
               cursor-pointer transition-all ease-in-out duration-300
               hover:bg-[#FFF0F4] hover:text-[#FF6B8A] hover:-translate-y-1 hover:shadow-md
               active:scale-95"
                onClick={() => openAuthDrawer("signin")}
                style={{
                  backgroundColor: "transparent",
                  borderColor: "#FF8DA1",
                }}
              >
                Sign In
              </Button>

              {/* Register 按钮：粉紫渐变，Hover时增加模糊阴影并缩放 */}
              <Button
                className="h-10 w-30 rounded-full border-none bg-gradient-to-r from-[#FF8CA3] to-[#C99FFF] px-6 font-medium text-white
               shadow-[0_4px_14px_rgba(201,159,255,0.35)]
               cursor-pointer transition-all ease-in-out duration-300
               hover:opacity-95 hover:shadow-[0_8px_20px_rgba(201,159,255,0.4)] hover:scale-105
               active:scale-95"
                onClick={() => openAuthDrawer("register")}
                style={{
                  background: "linear-gradient(to right, #FF8CA3, #C99FFF)",
                  boxShadow: "0 4px 14px rgba(201, 159, 255, 0.35)",
                }}
              >
                Register
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-[#F4C6B9] bg-white/70 text-[#4A2C2A] shadow-sm lg:hidden"
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

      {mobileOpen && (
        <div className="border-t border-white/70 bg-gradient-to-b from-white/95 to-[#FFF5F0]/95 backdrop-blur-xl lg:hidden">
          <div className="candy-wave container-content space-y-2 py-4">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={`${item.href}-${item.label}`}
                {...item}
                active={pathname === item.href}
                onClick={() => setMobileOpen(false)}
              />
            ))}

            <Link
              href="/lookup"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-2 py-2 text-[15px] font-semibold text-[#4A2C2A] transition-colors duration-200 hover:text-[#FF6B8A]"
            >
              <Search className="h-4 w-4" />
              Lookup
            </Link>

            <div className="pt-2">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-2xl px-3 py-2.5 text-sm font-semibold text-[#4A2C2A] hover:bg-[#FFF0F4] hover:text-[#FF6B8A]"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/claims"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-2xl px-3 py-2.5 text-sm font-semibold text-[#4A2C2A] hover:bg-[#FFF0F4] hover:text-[#FF6B8A]"
                  >
                    My Claims
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="block w-full rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-[#B54708] hover:bg-[#FFF0F4]"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="rounded-full border-[#F4C6B9] bg-white/90 text-[#4A2C2A] hover:bg-[#FFF0F4] hover:text-[#FF6B8A]"
                    onClick={() => {
                      openAuthDrawer("signin");
                      setMobileOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="rounded-full bg-gradient-to-r from-[#FF6B8A] via-[#FFB07C] to-[#F9E076] text-[#4A2C2A] shadow-[0_10px_24px_rgba(255,107,138,0.24)] hover:opacity-95"
                    onClick={() => {
                      openAuthDrawer("register");
                      setMobileOpen(false);
                    }}
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
