'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, X, Search, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { validatePhone } from '@/lib/auth-utils';
import { cn } from '@/lib/utils';

// ── Schemas ──

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  phone: z.string().min(1, 'Phone number is required').refine(validatePhone, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

// ═══════════════════════════════════════════════════════════════
// Input field — consistent emerald style
// ═══════════════════════════════════════════════════════════════
function Field({ label, id, type = 'text', placeholder, error, register, autoComplete }: {
  label: string; id: string; type?: string; placeholder?: string;
  error?: string; register: any; autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#003527' }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full h-10 px-3 rounded-lg text-sm border-0 outline-none transition-colors"
        style={{ background: 'rgba(0,53,39,0.04)', color: '#131b2e' }}
        {...register}
      />
      {error && <p className="text-xs" style={{ color: '#ba1a1a' }}>{error}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
export function AuthDrawer() {
  const { authDrawerOpen, authDrawerMode, closeAuthDrawer, openAuthDrawer, login, register } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState('');
  const [visible, setVisible] = useState(false);

  // Stagger entrance — trigger after mount
  useEffect(() => { if (authDrawerOpen) { const t = setTimeout(() => setVisible(true), 50); return () => clearTimeout(t); } else { setVisible(false); } }, [authDrawerOpen]);

  // Sign In form
  const signInForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const { handleSubmit: handleSignIn, formState: { errors: signInErrors, isSubmitting: signingIn } } = signInForm;

  // Register form
  const regForm = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });
  const { handleSubmit: handleRegister, formState: { errors: regErrors, isSubmitting: registering } } = regForm;

  const onSignIn = async (data: LoginFormData) => {
    setServerError('');
    const r = await login(data.email, data.password);
    if (!r.success) setServerError(r.error || 'Login failed.');
  };

  const onRegister = async (data: RegisterFormData) => {
    setServerError('');
    const r = await register({ name: data.name, email: data.email, phone: data.phone, password: data.password });
    if (!r.success) setServerError(r.error || 'Registration failed.');
  };

  const switchTab = (mode: 'signin' | 'register') => {
    setServerError('');
    openAuthDrawer(mode);
  };

  // ESC key to close
  useEffect(() => {
    if (!authDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAuthDrawer(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [authDrawerOpen, closeAuthDrawer]);

  // Lock body scroll when open
  useEffect(() => {
    if (authDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [authDrawerOpen]);

  if (!authDrawerOpen) return null;

  const isSignIn = authDrawerMode === 'signin';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,0.25)' }}
        onClick={closeAuthDrawer}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full sm:max-w-[460px] overflow-y-auto',
          'transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'translate-x-0',
        )}
        style={{ background: '#faf8ff' }}
      >
        {/* Close */}
        <button
          onClick={closeAuthDrawer}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full cursor-pointer transition-colors hover:bg-black/5"
          aria-label="Close"
        >
          <X className="h-5 w-5" style={{ color: '#003527' }} />
        </button>

        <div className={cn('p-8 pt-16', visible && 'stagger-in')}>
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-10">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: '#003527' }}>
              <Shield className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ color: '#003527' }}>KOI</span>
          </div>

          {/* Tab bar */}
          <div className="flex rounded-lg p-1 mb-8" style={{ background: 'rgba(0,53,39,0.06)' }}>
            {(['signin', 'register'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                className={cn(
                  'flex-1 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer',
                  authDrawerMode === tab
                    ? 'text-white'
                    : 'hover:text-[#003527]',
                )}
                style={authDrawerMode === tab ? { background: '#003527', color: '#ffffff' } : { color: '#404944' }}
              >
                {tab === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Error */}
          {serverError && (
            <div className="mb-6 p-3 rounded-lg text-sm" style={{ background: '#ffdad6', color: '#93000a', border: '1px solid rgba(186,26,26,0.15)' }}>
              {serverError}
            </div>
          )}

          {/* ── Sign In Form ── */}
          {isSignIn && (
            <form onSubmit={handleSignIn(onSignIn)} className="space-y-4">
              <Field label="Email Address" id="sd-email" type="email" placeholder="your@email.com"
                error={signInErrors.email?.message} register={signInForm.register('email')} autoComplete="email" />
              <div className="space-y-1.5">
                <label htmlFor="sd-pw" className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#003527' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="sd-pw"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full h-10 pl-3 pr-10 rounded-lg text-sm border-0 outline-none transition-colors"
                    style={{ background: 'rgba(0,53,39,0.04)', color: '#131b2e' }}
                    {...signInForm.register('password')}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70"
                    style={{ color: '#404944' }}>
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {signInErrors.password && <p className="text-xs" style={{ color: '#ba1a1a' }}>{signInErrors.password.message}</p>}
              </div>
              <button type="submit" disabled={signingIn}
                className="w-full h-10 rounded-lg text-sm font-semibold transition-colors cursor-pointer text-white"
                style={{ background: '#003527' }}>
                {signingIn ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* ── Register Form ── */}
          {!isSignIn && (
            <form onSubmit={handleRegister(onRegister)} className="space-y-3.5">
              <Field label="Full Name" id="sd-name" placeholder="Your full name"
                error={regErrors.name?.message} register={regForm.register('name')} autoComplete="name" />
              <Field label="Email Address" id="sd-remail" type="email" placeholder="your@email.com"
                error={regErrors.email?.message} register={regForm.register('email')} autoComplete="email" />
              <Field label="Phone Number" id="sd-phone" type="tel" placeholder="13812341234"
                error={regErrors.phone?.message} register={regForm.register('phone')} autoComplete="tel" />
              <div className="space-y-1.5">
                <label htmlFor="sd-rpw" className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#003527' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="sd-rpw"
                    type={showPw ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    className="w-full h-10 pl-3 pr-10 rounded-lg text-sm border-0 outline-none transition-colors"
                    style={{ background: 'rgba(0,53,39,0.04)', color: '#131b2e' }}
                    {...regForm.register('password')}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70"
                    style={{ color: '#404944' }}>
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {regErrors.password && <p className="text-xs" style={{ color: '#ba1a1a' }}>{regErrors.password.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sd-cpw" className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#003527' }}>
                  Confirm Password
                </label>
                <input
                  id="sd-cpw"
                  type="password"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className="w-full h-10 px-3 rounded-lg text-sm border-0 outline-none transition-colors"
                  style={{ background: 'rgba(0,53,39,0.04)', color: '#131b2e' }}
                  {...regForm.register('confirmPassword')}
                />
                {regErrors.confirmPassword && <p className="text-xs" style={{ color: '#ba1a1a' }}>{regErrors.confirmPassword.message}</p>}
              </div>
              <button type="submit" disabled={registering}
                className="w-full h-10 rounded-lg text-sm font-semibold transition-colors cursor-pointer text-white mt-2"
                style={{ background: '#003527' }}>
                {registering ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Guest lookup link */}
          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: 'rgba(0,53,39,0.1)' }}>
            <Link
              href="/lookup"
              onClick={closeAuthDrawer}
              className="inline-flex items-center gap-2 text-sm transition-colors hover:underline"
              style={{ color: '#404944' }}
            >
              <Search className="h-4 w-4" />
              Check Status Without Account
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
