'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/api/api';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage('');
      setError('');
      await resetPassword({ token, newPassword });
      setMessage('Password reset successful. You can now log in with your new password.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900/90 border border-gray-700/50 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
        <p className="text-gray-400 text-sm mb-5">Paste your reset token and set a new password.</p>

        {message ? <div className="mb-4 text-sm text-green-300 bg-green-900/20 border border-green-700/50 rounded p-3">{message}</div> : null}
        {error ? <div className="mb-4 text-sm text-red-300 bg-red-900/20 border border-red-700/50 rounded p-3">{error}</div> : null}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Reset token"
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
            required
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
            minLength={8}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm px-3 py-2"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4">
          Back to
          {' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">Login</Link>
        </p>
      </div>
    </div>
  );
}
