'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { resendVerification, verifyEmail } from '@/api/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [verificationOtp, setVerificationOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const incomingEmail = searchParams.get('email');
    if (incomingEmail) {
      setEmail(incomingEmail);
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
      await verifyEmail({ email, verificationOtp });
      setMessage('Email verified successfully.');
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
      await resendVerification({ email });
      setMessage('Verification code sent.');
      setCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900/90 border border-gray-700/50 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Verify Email</h1>
        <p className="text-gray-400 text-sm mb-5">Enter your email and 6-digit verification code.</p>

        {message ? <div className="mb-4 text-sm text-green-300 bg-green-900/20 border border-green-700/50 rounded p-3">{message}</div> : null}
        {error ? <div className="mb-4 text-sm text-red-300 bg-red-900/20 border border-red-700/50 rounded p-3">{error}</div> : null}

        <form onSubmit={handleVerify} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
            required
          />
          <input
            value={verificationOtp}
            onChange={(e) => setVerificationOtp(e.target.value)}
            placeholder="6-digit OTP"
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
            pattern="\d{6}"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm px-3 py-2"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => void handleResend()}
          disabled={resending || cooldown > 0 || !email}
          className="mt-3 w-full rounded-md border border-gray-700 text-gray-300 hover:text-white disabled:opacity-50 text-sm px-3 py-2"
        >
          {resending ? 'Resending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Code'}
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Back to
          {' '}
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
