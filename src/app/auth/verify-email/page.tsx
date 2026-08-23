'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { resendVerification, verifyEmail } from '@/api/api';
import {
  clearPendingEmailVerificationEmail,
  getPendingEmailVerificationEmail,
  savePendingEmailVerificationEmail,
} from '@/lib/authFlow';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { fieldClass, primaryButtonClass, secondaryButtonClass } from '@/styles/design-tokens';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [verificationOtp, setVerificationOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const incomingEmail = searchParams.get('email');
    const draftEmail = String(incomingEmail || '').trim().toLowerCase() || getPendingEmailVerificationEmail() || '';

    if (draftEmail) {
      setEmail(draftEmail);
      savePendingEmailVerificationEmail(draftEmail);
    }
  }, [searchParams]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage('');
      setError('');
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const normalizedOtp = String(verificationOtp || '').replace(/\D/g, '').slice(0, 6);

      savePendingEmailVerificationEmail(normalizedEmail);
      await verifyEmail({ email: normalizedEmail, verificationOtp: normalizedOtp });
      clearPendingEmailVerificationEmail();
      setVerificationComplete(true);
      setMessage('Email verified successfully. You can now log in.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      setMessage('');
      setError('');
      const normalizedEmail = String(email || '').trim().toLowerCase();

      savePendingEmailVerificationEmail(normalizedEmail);
      await resendVerification({ email: normalizedEmail });
      setMessage('Verification code sent.');
      setCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification code');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthPageLayout title="Verify email" description="Enter your email and 6-digit verification code.">
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

      {verificationComplete ? (
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
          <p className="font-medium">Account verified.</p>
          <p className="mt-1">You can continue to login with your existing credentials.</p>
          <Link href="/login" className="mt-3 inline-flex font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300">
            Go to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`${fieldClass} mt-1 w-full`}
              required
            />
          </div>

          <div>
            <label htmlFor="verificationOtp" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Verification code
            </label>
            <input
              id="verificationOtp"
              name="verificationOtp"
              value={verificationOtp}
              onChange={(e) => setVerificationOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit OTP"
              className={`${fieldClass} mt-1 w-full`}
              pattern="\d{6}"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
            />
          </div>

          <button type="submit" disabled={loading} className={`${primaryButtonClass} w-full`}>
            {loading ? 'Verifying…' : 'Verify email'}
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={() => void handleResend()}
        disabled={resending || cooldown > 0 || !email || verificationComplete}
        className={`${secondaryButtonClass} mt-3 w-full disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {resending ? 'Resending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification code'}
      </button>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Back to{' '}
        <Link href="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          sign in
        </Link>
      </p>
    </AuthPageLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
