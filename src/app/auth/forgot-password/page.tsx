'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/api/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage('');
      setError('');
      await forgotPassword({ email });
      setMessage('Password reset instructions were sent to your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900/90 border border-gray-700/50 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Forgot Password</h1>
        <p className="text-gray-400 text-sm mb-5">Enter your email to receive reset instructions.</p>

        {message ? <div className="mb-4 text-sm text-green-300 bg-green-900/20 border border-green-700/50 rounded p-3">{message}</div> : null}
        {error ? <div className="mb-4 text-sm text-red-300 bg-red-900/20 border border-red-700/50 rounded p-3">{error}</div> : null}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm px-3 py-2"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4">
          Back to
          {' '}
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">Login</Link>
        </p>
      </div>
    </div>
  );
}
