'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/lib/auth-context';
import { AuthDrawer } from '@/components/auth/auth-drawer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delay={300}>
      <AuthProvider>
        {children}
        <AuthDrawer />
      </AuthProvider>
    </TooltipProvider>
  );
}
