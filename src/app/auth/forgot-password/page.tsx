'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forgotPassword } from '@/api/api';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { fieldClass, primaryButtonClass } from '@/styles/design-tokens';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');
      const normalizedEmail = String(email || '').trim().toLowerCase();
      await forgotPassword({ email: normalizedEmail });
      router.replace(`/auth/verify-reset-code?email=${encodeURIComponent(normalizedEmail)}&sent=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout title="Reset password" description="We will email you a verification code.">
      {error ? (
        <div className="mb-4 rounded-2xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${fieldClass} mt-1 w-full`} required />
        </div>
        <button type="submit" disabled={loading} className={`${primaryButtonClass} w-full`}>
          {loading ? 'Sending…' : 'Send reset code'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        <Link href="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">Back to sign in</Link>
      </p>
    </AuthPageLayout>
  );
}
