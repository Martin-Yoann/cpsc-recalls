'use client';

// ============================================================
// KOI Recall Platform — Profile Page v2.0 (Neon-backed)
// Edit display name + upload avatar (stored as data URL in consumer_users)
// ============================================================

import { useRef, useState } from 'react';
import { User, Mail, Phone, Calendar, Shield, Camera, Check, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const AVATAR_MAX_BYTES = 512 * 1024; // matches backend ceiling

/** Read a File as a data URL, downscaling large images via canvas to fit the byte cap. */
function fileToAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file (JPEG, PNG, or WebP).'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.onload = () => {
      const src = reader.result as string;
      // If already small enough, use as-is
      if (src.length * 0.75 <= AVATAR_MAX_BYTES) {
        resolve(src);
        return;
      }
      // Downscale via canvas
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const scale = Math.min(1, Math.sqrt((AVATAR_MAX_BYTES * 0.9) / (width * height * 0.5)));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not available.')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        // Try JPEG first (smaller), fall back to PNG
        let out = canvas.toDataURL('image/jpeg', 0.85);
        if (out.length * 0.75 > AVATAR_MAX_BYTES) out = canvas.toDataURL('image/jpeg', 0.6);
        if (out.length * 0.75 > AVATAR_MAX_BYTES) reject(new Error('Image is too large even after compression. Please use a smaller image.'));
        else resolve(out);
      };
      img.onerror = () => reject(new Error('Could not decode the image.'));
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? '');
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const initials = user?.name?.slice(0, 2).toUpperCase() || 'U';

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg(null);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      const r = await updateProfile({ avatarDataUrl: dataUrl });
      if (r.success) setMsg({ kind: 'ok', text: 'Avatar updated.' });
      else setMsg({ kind: 'err', text: r.error || 'Upload failed.' });
    } catch (err) {
      setMsg({ kind: 'err', text: err instanceof Error ? err.message : 'Upload failed.' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSaveName = async () => {
    if (!name.trim()) {
      setMsg({ kind: 'err', text: 'Name cannot be empty.' });
      return;
    }
    setSavingName(true);
    setMsg(null);
    const r = await updateProfile({ name: name.trim() });
    if (r.success) setMsg({ kind: 'ok', text: 'Name updated.' });
    else setMsg({ kind: 'err', text: r.error || 'Update failed.' });
    setSavingName(false);
  };

  const handleRemoveAvatar = async () => {
    setUploading(true);
    setMsg(null);
    const r = await updateProfile({ avatarDataUrl: null });
    if (r.success) setMsg({ kind: 'ok', text: 'Avatar removed.' });
    else setMsg({ kind: 'err', text: r.error || 'Could not remove avatar.' });
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your account information · saved to Neon</p>
      </div>

      {msg && (
        <div className={cn(
          'rounded-lg p-3 text-sm flex items-center gap-2',
          msg.kind === 'ok' ? 'bg-blade-resolution-light/60 text-blade-resolution' : 'bg-red-50 text-red-700',
        )}>
          {msg.kind === 'ok' ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {msg.text}
        </div>
      )}

      {/* Avatar + identity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-brand-teal" />
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-secondary">
            <div className="relative shrink-0">
              {user?.avatarDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarDataUrl}
                  alt={user.name}
                  className="h-16 w-16 rounded-xl object-cover border"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-teal text-white text-xl font-bold">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-surface-elevated border shadow-sm hover:bg-surface-secondary cursor-pointer transition-colors disabled:opacity-50"
                aria-label="Change avatar"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-text-secondary" /> : <Camera className="h-3.5 w-3.5 text-text-secondary" />}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-text-primary truncate">{user?.name}</p>
              <p className="text-sm text-text-secondary">Consumer</p>
              {user?.avatarDataUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={uploading}
                  className="mt-1 text-xs text-text-tertiary hover:text-red-600 cursor-pointer transition-colors disabled:opacity-50"
                >
                  Remove avatar
                </button>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: 'Email', value: user?.email, icon: Mail },
              { label: 'Phone', value: user?.phone || '—', icon: Phone },
              { label: 'Registered', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—', icon: Calendar },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary border">
                <item.icon className="h-4.5 w-4.5 text-text-tertiary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-text-tertiary">{item.label}</p>
                  <p className="text-sm font-semibold text-text-primary truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-brand-teal" />
            Edit Display Name
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your display name"
              className="flex-1 h-10 px-3 rounded-lg border bg-surface-elevated text-sm outline-none focus:border-brand-teal"
              style={{ borderColor: 'var(--border)' }}
            />
            <Button
              onClick={handleSaveName}
              disabled={savingName || name.trim() === (user?.name ?? '')}
              className="bg-brand-teal hover:bg-blade-resolution-dark text-white cursor-pointer disabled:opacity-50"
            >
              {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
          <p className="text-xs text-text-tertiary">Visible across your claims and dashboard. Changes are saved to your Neon account.</p>
        </CardContent>
      </Card>
    </div>
  );
}
