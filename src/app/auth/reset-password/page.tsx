'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { resetPassword } from '@/api/api';
import {
  getPendingPasswordResetEmail,
  getPendingPasswordResetToken,
} from '@/lib/authFlow';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { fieldClass, primaryButtonClass, secondaryButtonClass } from '@/styles/design-tokens';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasResetToken, setHasResetToken] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const storedToken = getPendingPasswordResetToken();
    const storedEmail = getPendingPasswordResetEmail();

    setHasResetToken(Boolean(storedToken));
    setResetEmail(storedEmail);
    setIsReady(true);
  }, []);

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      setError('');
      await resetPassword({ newPassword });
      setMessage('Password reset successful. Redirecting to login...');
      setNewPassword('');
      setConfirmPassword('');

      window.setTimeout(() => {
        router.replace('/login?reset=success');
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const verifyCodeHref = resetEmail
    ? `/auth/verify-reset-code?email=${encodeURIComponent(resetEmail)}`
    : '/auth/verify-reset-code';

  if (!isReady) {
    return (
      <AuthPageLayout title="Reset password" description="Choose a new password for your account.">
        <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">Loading reset session…</p>
      </AuthPageLayout>
    );
  }

  if (!hasResetToken) {
    return (
      <AuthPageLayout
        title="Reset password"
        description="Verify your reset code first, then return here to set a new password."
      >
        <div className="mb-4 rounded-2xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          We could not find a verified reset session for this browser session.
        </div>

        <div className="space-y-3">
          <Link href={verifyCodeHref} className={`${primaryButtonClass} flex w-full items-center justify-center`}>
            Go to verify code
          </Link>
          <Link href="/auth/forgot-password" className={`${secondaryButtonClass} flex w-full items-center justify-center`}>
            Start over
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <Link href="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            Back to sign in
          </Link>
        </p>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout title="Reset password" description="Choose a new password for your account.">
      {message ? (
        <div className="mb-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-2xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {resetEmail ? (
        <div className="mb-4 rounded-2xl border border-slate-200/70 bg-slate-50/90 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          Reset session verified for {resetEmail}
        </div>
      ) : null}

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            New password
          </label>
          <div className="relative mt-1">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="newPassword"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className={`${fieldClass} w-full pl-10 pr-10`}
              placeholder="Enter a new password"
              minLength={8}
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
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Use at least 8 characters with a mix of letters, numbers, and symbols.
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirm password
          </label>
          <div className="relative mt-1">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={`${fieldClass} w-full pl-10 pr-10`}
              placeholder="Confirm your new password"
              minLength={8}
              required
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className={`${primaryButtonClass} w-full`}>
          {loading ? 'Resetting…' : 'Reset password'}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between gap-3 text-sm">
        <Link href={verifyCodeHref} className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          Back to verify code
        </Link>
        <Link href="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          Back to sign in
        </Link>
      </div>
    </AuthPageLayout>
  );
}
