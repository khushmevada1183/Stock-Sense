'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { resetPassword } from '@/api/api';
import {
  getPendingPasswordResetEmail,
  getPendingPasswordResetToken,
} from '@/lib/authFlow';

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

  const renderShell = (body: ReactNode) => (
    <div className="auth-shell relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="auth-shell-overlay absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-indigo-950/90">
        <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-16 right-16 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute right-1/3 top-24 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="auth-panel w-full max-w-lg rounded-2xl border border-white/40 bg-white/95 p-6 shadow-2xl backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/95 sm:p-8">
          {body}
        </div>
      </div>
    </div>
  );

  if (!isReady) {
    return renderShell(
      <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-300">
        Loading reset session...
      </div>
    );
  }

  if (!hasResetToken) {
    return renderShell(
      <>
        <div className="mb-6 flex items-center justify-between">
          <div className="auth-badge flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="auth-badge-soft flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Lock className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </div>
        </div>

        <div className="mb-6">
          <h1 className="auth-title mb-2 text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">Reset Password</h1>
          <p className="auth-copy text-sm text-gray-600 dark:text-slate-300 sm:text-base">
            Verify your reset code first, then return here to set a new password.
          </p>
        </div>

        <div className="auth-feedback-error mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-950/50 dark:text-red-300">
          We could not find a verified reset session for this browser session.
        </div>

        <div className="space-y-3">
          <Link
            href={verifyCodeHref}
            className="auth-button-primary flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200"
          >
            Go to Verify Code
          </Link>
          <Link
            href="/auth/forgot-password"
            className="auth-button-secondary flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-2 text-base font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Start Over
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="auth-link inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            Back to Login
          </Link>
        </div>
      </>
    );
  }

  return renderShell(
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="auth-badge flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="auth-badge-soft flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Lock className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </div>
      </div>

      <div className="mb-6">
        <h1 className="auth-title mb-2 text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">Reset Password</h1>
        <p className="auth-copy text-sm text-gray-600 dark:text-slate-300 sm:text-base">
          Choose a new password for your account.
        </p>
      </div>

      {message ? (
        <div className="auth-feedback-success mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-200">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="auth-feedback-error mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {resetEmail ? (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          Reset session verified for {resetEmail}
        </div>
      ) : null}

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="auth-label mb-1 block text-sm font-medium text-gray-700 dark:text-slate-200">
            New Password
          </label>
          <div className="relative">
            <Lock className="auth-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-slate-400" />
            <input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="auth-input w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 pl-10 pr-11 text-sm text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-blue-400 dark:focus:bg-slate-800"
              placeholder="Enter a new password"
              minLength={8}
              required
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
              className="auth-muted absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">Use at least 8 characters with a mix of letters, numbers, and symbols.</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="auth-label mb-1 block text-sm font-medium text-gray-700 dark:text-slate-200">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="auth-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-slate-400" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="auth-input w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 pl-10 pr-11 text-sm text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-blue-400 dark:focus:bg-slate-800"
              placeholder="Confirm your new password"
              minLength={8}
              required
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="auth-muted absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="auth-button-primary w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between gap-3 text-sm">
        <Link href={verifyCodeHref} className="auth-link font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
          Back to Verify Code
        </Link>
        <Link href="/login" className="auth-link font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
          Back to Login
        </Link>
      </div>
    </>
  );
}
