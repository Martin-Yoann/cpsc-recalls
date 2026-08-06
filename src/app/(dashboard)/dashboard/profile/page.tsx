'use client';

// ============================================================
// KOI Recall Platform — Profile Page
// ============================================================

import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-brand-teal" />
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-secondary">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-teal text-white text-lg font-bold">
              {user?.name?.slice(0, 2).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary">{user?.name}</p>
              <p className="text-sm text-text-secondary">Consumer</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: 'Name', value: user?.name, icon: User },
              { label: 'Email', value: user?.email, icon: Mail },
              { label: 'Phone', value: user?.phone, icon: Phone },
              { label: 'Registered', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—', icon: Calendar },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary border">
                <item.icon className="h-4.5 w-4.5 text-text-tertiary shrink-0" />
                <div>
                  <p className="text-xs text-text-tertiary">{item.label}</p>
                  <p className="text-sm font-semibold text-text-primary">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
