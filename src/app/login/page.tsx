'use client';

import { Suspense, useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { fieldClass, primaryButtonClass } from '@/styles/design-tokens';
import { safeRedirectPath } from '@/lib/safeRedirect';

function LoginContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const safeRedirectTo = safeRedirectPath(searchParams.get('redirect'), '/');
  const resetSuccess = searchParams.get('reset') === 'success';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.replace(safeRedirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout title="Sign in" description="Access your portfolio, watchlists, and alerts.">
      {resetSuccess ? (
        <div className="mb-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
          Password reset successful. You can now sign in with your new password.
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-2xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Email
          </label>
          <div className="relative mt-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${fieldClass} w-full pl-10`}
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
          </label>
          <div className="relative mt-1">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${fieldClass} w-full pl-10 pr-10`}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-emerald-500"
            />
            Remember me
          </label>
          <Link href="/auth/forgot-password" className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={loading} className={`${primaryButtonClass} w-full`}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          Create account
        </Link>
      </p>
    </AuthPageLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <LoginContent />
    </Suspense>
  );
}
