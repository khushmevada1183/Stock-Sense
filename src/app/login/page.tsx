'use client';

import React, { Suspense, useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

const LoginContent: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = searchParams.get('redirect');
  const safeRedirectTo = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/';
  const resetSuccess = searchParams.get('reset') === 'success';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.replace(safeRedirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Placeholder until provider OAuth endpoints are integrated.
    console.log(`Social login with ${provider}`);
  };

  return (
    <div className="auth-shell relative h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500">
      <div className="auth-shell-overlay absolute inset-0 bg-gradient-to-br from-blue-500/90 via-purple-600/90 to-pink-500/90">
        <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-20 right-20 h-60 w-60 rounded-full bg-yellow-300/20 blur-3xl" />
        <div className="absolute right-12 top-1/2 h-32 w-32 rounded-full bg-pink-300/20 blur-2xl" />
        <div className="absolute right-1/3 top-20 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="absolute bottom-32 left-1/4 h-36 w-36 rounded-full bg-cyan-300/20 blur-2xl" />
      </div>

      <div className="relative flex h-full w-full flex-col items-center justify-center sm:flex-row">
        <div className="hidden px-6 text-center text-white sm:block sm:w-1/2 lg:w-3/5">
          <div className="mx-auto max-w-xl">
            <div className="mb-8">
              <div className="auth-badge mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <svg className="h-14 w-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </div>
              <h2 className="auth-title mb-4 text-4xl font-bold">Welcome to Stock Sense</h2>
              <p className="auth-copy text-xl opacity-90">Discover market intelligence and AI-driven stock insights from one dashboard.</p>
            </div>

            <div className="mt-12 flex justify-center space-x-6">
              <div className="auth-badge-soft flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="auth-badge-soft flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-1 16H9V7h9v14z" />
                </svg>
              </div>
              <div className="auth-badge-soft flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM12 17.5L8.5 15l3.5-2.5 3.5 2.5-3.5 2.5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-md items-center justify-center sm:w-1/2 sm:max-w-lg lg:w-2/5">
          <div className="auth-panel m-[15px] max-h-[calc(100vh-30px)] w-full overflow-y-auto rounded-2xl border border-white/40 bg-white/95 p-6 shadow-2xl backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/95 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="auth-badge flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 sm:h-12 sm:w-12">
                <LogIn className="h-5 w-5 text-emerald-600 sm:h-6 sm:w-6 dark:text-emerald-400" />
              </div>
              <div className="flex space-x-3">
                <div className="auth-badge-soft flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 sm:h-10 sm:w-10">
                  <svg className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div className="auth-badge flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 sm:h-10 sm:w-10">
                  <svg className="h-4 w-4 text-yellow-600 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 14h-2v-4h2m0 8h-2v-2h2M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h1 className="auth-title mb-2 text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">Login</h1>
            </div>

            {resetSuccess && (
              <div className="auth-feedback-success mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/50 dark:bg-emerald-950/60">
                <p className="text-sm text-emerald-700 dark:text-emerald-300">Password reset successful. You can now sign in with your new password.</p>
              </div>
            )}

            {error && (
              <div className="auth-feedback-error mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/50 dark:bg-red-950/60">
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">

              <div>
                <label htmlFor="email" className="auth-label mb-1 block text-sm font-medium text-gray-700 dark:text-slate-200">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="auth-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 pl-10 text-sm text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-blue-400 dark:focus:bg-slate-800"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="auth-label mb-1 block text-sm font-medium text-gray-700 dark:text-slate-200">
                  Password
                </label>
                <div className="relative">
                  <Lock className="auth-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 pl-10 pr-11 text-sm text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-blue-400 dark:focus:bg-slate-800"
                    placeholder="Enter your password"
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
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 bg-white accent-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 dark:border-slate-500 dark:bg-slate-800"
                  />
                  <span className="auth-label ml-2 text-sm text-gray-700 dark:text-slate-200">Remember me</span>
                </label>
                <Link href="/auth/forgot-password" className="auth-link text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-button-primary w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>

            <div className="mt-6">
              <p className="auth-muted mb-3 text-center text-xs text-gray-500 dark:text-slate-400">OR CONTINUE WITH</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="auth-social-button flex flex-col items-center justify-center rounded-xl border border-gray-200 px-2 py-3 transition-colors duration-200 hover:bg-gray-50 dark:border-slate-600 dark:hover:bg-slate-800"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="auth-social-label mt-2 text-xs font-medium text-gray-700 dark:text-slate-200">Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('apple')}
                  className="auth-social-button flex flex-col items-center justify-center rounded-xl border border-gray-200 px-2 py-3 transition-colors duration-200 hover:bg-gray-50 dark:border-slate-600 dark:hover:bg-slate-800"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <span className="auth-social-label mt-2 text-xs font-medium text-gray-700 dark:text-slate-200">Apple</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  className="auth-social-button flex flex-col items-center justify-center rounded-xl border border-gray-200 px-2 py-3 transition-colors duration-200 hover:bg-gray-50 dark:border-slate-600 dark:hover:bg-slate-800"
                >
                  <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="auth-social-label mt-2 text-xs font-medium text-gray-700 dark:text-slate-200">Facebook</span>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="auth-muted text-sm text-gray-600 dark:text-slate-300">Don't have an account? </span>
              <Link href="/signup" className="auth-link text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Sign up here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginContent />
    </Suspense>
  );
}
