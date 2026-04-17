'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProfile, oauthLogin, refreshAuthToken, updateProfile } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import { getRefreshToken } from '@/lib/auth';

export default function ProfilePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshingToken, setRefreshingToken] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [oauthProvider, setOauthProvider] = useState<'google' | 'facebook'>('google');
  const [oauthIdToken, setOauthIdToken] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const response = await getProfile();
        const profile = response?.data?.user || response?.user || response?.data || response;

        setEmail(String(profile?.email || ''));
        setFullName(String(profile?.fullName || ''));
        setFirstName(String(profile?.first_name || profile?.firstName || ''));
        setLastName(String(profile?.last_name || profile?.lastName || ''));
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [isAuthenticated]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setMessage('');

      await updateProfile({
        fullName: fullName.trim() || undefined,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });

      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshToken = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      setError('Refresh token not found. Please log in again.');
      return;
    }

    try {
      setRefreshingToken(true);
      setError('');
      setMessage('');

      await refreshAuthToken(refreshToken);
      setMessage('Access token refreshed successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh access token');
    } finally {
      setRefreshingToken(false);
    }
  };

  const handleOauthLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!oauthIdToken.trim()) {
      setError('OAuth idToken is required for oauth login test.');
      return;
    }

    try {
      setOauthLoading(true);
      setError('');
      setMessage('');

      await oauthLogin({
        provider: oauthProvider,
        idToken: oauthIdToken.trim(),
      });

      setMessage('OAuth login API call succeeded and tokens were updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth login failed');
    } finally {
      setOauthLoading(false);
    }
  };

  if (authLoading) {
    return <div className="container mx-auto px-4 py-10 text-gray-300">Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto bg-gray-900/90 border border-gray-700/50 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-300 mb-4">Please log in to edit your profile.</p>
          <Link href="/auth/login" className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-gray-900/90 border border-gray-700/50 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-gray-400 text-sm mb-5">Update your account profile details.</p>

        {error ? <div className="mb-4 text-sm text-red-300 bg-red-900/20 border border-red-700/50 rounded p-3">{error}</div> : null}
        {message ? <div className="mb-4 text-sm text-green-300 bg-green-900/20 border border-green-700/50 rounded p-3">{message}</div> : null}

        {loading ? (
          <p className="text-sm text-gray-400">Loading profile...</p>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleSave} className="space-y-3">
              <input
                type="email"
                value={email}
                readOnly
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-400"
              />
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
                />
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm px-3 py-2"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>

            <div className="border border-gray-700/70 rounded-lg p-4 space-y-3">
              <h2 className="text-sm font-semibold text-white">Token Management</h2>
              <button
                type="button"
                onClick={() => void handleRefreshToken()}
                disabled={refreshingToken}
                className="w-full rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white text-sm px-3 py-2"
              >
                {refreshingToken ? 'Refreshing Token...' : 'Refresh Access Token'}
              </button>
            </div>

            <form onSubmit={handleOauthLogin} className="border border-gray-700/70 rounded-lg p-4 space-y-3">
              <h2 className="text-sm font-semibold text-white">OAuth API Validation</h2>
              <p className="text-xs text-gray-400">Use a provider id token to validate POST /auth/oauth/login integration.</p>
              <select
                value={oauthProvider}
                onChange={(e) => setOauthProvider(e.target.value as 'google' | 'facebook')}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
              >
                <option value="google">google</option>
                <option value="facebook">facebook</option>
              </select>
              <textarea
                value={oauthIdToken}
                onChange={(e) => setOauthIdToken(e.target.value)}
                placeholder="Paste OAuth idToken"
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
              />
              <button
                type="submit"
                disabled={oauthLoading}
                className="w-full rounded-md bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white text-sm px-3 py-2"
              >
                {oauthLoading ? 'Testing OAuth Login...' : 'Run OAuth Login'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}