'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ShieldCheck } from 'lucide-react';
import { verifyResetCode } from '@/api/api';
import {
  getPendingPasswordResetEmail,
  savePendingPasswordResetEmail,
} from '@/lib/authFlow';

const RESET_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{8}$/;

function VerifyResetCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const incomingEmail = String(searchParams.get('email') || '').trim().toLowerCase();
    const savedEmail = getPendingPasswordResetEmail();
    const nextEmail = incomingEmail || savedEmail;

    if (nextEmail) {
      setEmail(nextEmail);
      savePendingPasswordResetEmail(nextEmail);
    }

    if (searchParams.get('sent') === '1') {
      setMessage('A reset code has been sent to your email. Check your inbox and spam folder.');
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage('');
      setError('');

      const normalizedEmail = String(email || '').trim().toLowerCase();
      const normalizedCode = String(resetCode || '')
        .toUpperCase()
        .replace(/[^A-HJ-NP-Z2-9]/g, '')
        .slice(0, 8);

      if (!RESET_CODE_PATTERN.test(normalizedCode)) {
        setError('Reset code must be 8 characters and contain only valid uppercase characters.');
        return;
      }

      savePendingPasswordResetEmail(normalizedEmail);
      await verifyResetCode({ email: normalizedEmail, resetCode: normalizedCode });
      router.replace('/auth/reset-password');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="auth-shell-overlay absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-indigo-950/90">
        <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-16 right-16 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute right-1/3 top-24 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="auth-panel w-full max-w-lg rounded-2xl border border-white/40 bg-white/95 p-6 shadow-2xl backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/95 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="auth-badge flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="auth-badge-soft flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Mail className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </div>
          </div>

          <div className="mb-6">
            <h1 className="auth-title mb-2 text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">Verify Reset Code</h1>
            <p className="auth-copy text-sm text-gray-600 dark:text-slate-300 sm:text-base">
              Enter the email linked to your account and the 8-character code we sent to your inbox.
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="auth-label mb-1 block text-sm font-medium text-gray-700 dark:text-slate-200">
                Email Address
              </label>
              <div className="relative">
                <Mail className="auth-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="auth-input w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 pl-10 text-sm text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-blue-400 dark:focus:bg-slate-800"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="resetCode" className="auth-label mb-1 block text-sm font-medium text-gray-700 dark:text-slate-200">
                Reset Code
              </label>
              <input
                id="resetCode"
                value={resetCode}
                onChange={(event) => setResetCode(event.target.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, '').slice(0, 8))}
                className="auth-input w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-center text-sm uppercase tracking-[0.35em] text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-blue-400 dark:focus:bg-slate-800"
                placeholder="ABCDEFGH"
                pattern="[A-HJ-NP-Z2-9]{8}"
                inputMode="text"
                maxLength={8}
                required
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                Use the 8-character code from your reset email.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-button-primary w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between gap-3 text-sm">
            <Link href="/auth/forgot-password" className="auth-link font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Edit email
            </Link>
            <Link href="/login" className="auth-link font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyResetCodePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <VerifyResetCodeContent />
    </Suspense>
  );
}
