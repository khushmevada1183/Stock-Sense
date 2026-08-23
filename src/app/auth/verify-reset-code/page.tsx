'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail } from 'lucide-react';
import { verifyResetCode } from '@/api/api';
import {
  getPendingPasswordResetEmail,
  savePendingPasswordResetEmail,
} from '@/lib/authFlow';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { fieldClass, primaryButtonClass } from '@/styles/design-tokens';

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
    <AuthPageLayout
      title="Verify reset code"
      description="Enter the email linked to your account and the 8-character code we sent to your inbox."
    >
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

      <form onSubmit={handleSubmit} className="space-y-4">
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
              onChange={(event) => setEmail(event.target.value)}
              className={`${fieldClass} w-full pl-10`}
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="resetCode" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Reset code
          </label>
          <input
            id="resetCode"
            name="resetCode"
            value={resetCode}
            onChange={(event) => setResetCode(event.target.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, '').slice(0, 8))}
            className={`${fieldClass} mt-1 w-full text-center uppercase tracking-[0.35em]`}
            placeholder="ABCDEFGH"
            pattern="[A-HJ-NP-Z2-9]{8}"
            inputMode="text"
            autoComplete="one-time-code"
            maxLength={8}
            required
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Use the 8-character code from your reset email.
          </p>
        </div>

        <button type="submit" disabled={loading} className={`${primaryButtonClass} w-full`}>
          {loading ? 'Verifying…' : 'Verify code'}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between gap-3 text-sm">
        <Link href="/auth/forgot-password" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          Edit email
        </Link>
        <Link href="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          Back to sign in
        </Link>
      </div>
    </AuthPageLayout>
  );
}

export default function VerifyResetCodePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <VerifyResetCodeContent />
    </Suspense>
  );
}
