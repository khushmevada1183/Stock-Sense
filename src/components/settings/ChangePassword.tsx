'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Eye, EyeOff, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { Input } from '@/components/ui/input';
import { changeSettingsPassword, getSettingsPasswordPolicy } from '@/lib/api';

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
};

export default function ChangePassword() {
  const query = useQuery({
    queryKey: ['settings', 'password-policy'],
    queryFn: getSettingsPasswordPolicy,
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const policy = query.data?.data;

  const mutation = useMutation({
    mutationFn: changeSettingsPassword,
    onSuccess: (response) => {
      setFormError('');
      setFormMessage(response.data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : 'Failed to update password');
    },
  });

  const passwordStrength = useMemo(() => {
    const value = newPassword;
    let score = 0;

    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    if (score <= 1) {
      return { label: 'Weak', tone: 'bg-rose-400', width: '25%' };
    }

    if (score === 2) {
      return { label: 'Fair', tone: 'bg-amber-400', width: '50%' };
    }

    if (score === 3) {
      return { label: 'Strong', tone: 'bg-cyan-400', width: '75%' };
    }

    return { label: 'Excellent', tone: 'bg-emerald-400', width: '100%' };
  }, [newPassword]);

  const validate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return 'Fill in all password fields.';
    }

    if (policy && newPassword.length < policy.minLength) {
      return `New password must be at least ${policy.minLength} characters long.`;
    }

    if (policy?.requiresUppercase && !/[A-Z]/.test(newPassword)) {
      return 'New password must include at least one uppercase letter.';
    }

    if (policy?.requiresNumber && !/\d/.test(newPassword)) {
      return 'New password must include at least one number.';
    }

    if (policy?.requiresSymbol && !/[^A-Za-z0-9]/.test(newPassword)) {
      return 'New password must include at least one symbol.';
    }

    if (newPassword !== confirmPassword) {
      return 'New password and confirm password do not match.';
    }

    return '';
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const error = validate();
    if (error) {
      setFormError(error);
      setFormMessage('');
      return;
    }

    setFormError('');
    setFormMessage('');

    await mutation.mutateAsync({
      currentPassword,
      newPassword,
      confirmPassword,
    });
  };

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-44 w-full rounded-[20px]" />
        <LoadingSkeleton className="h-64 w-full rounded-[20px]" />
      </div>
    );
  }

  if (query.isError || !policy) {
    return <div className="rounded-[20px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">Failed to load password policy.</div>;
  }

  return (
    <Card className="rounded-[24px] border border-slate-200 bg-white shadow-none transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="mt-0 text-xl text-slate-950 dark:text-white">Change password</CardTitle>
            <CardDescription className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Use a strong password and keep your account protected with current policy checks.
            </CardDescription>
          </div>

          <button
            type="button"
            onClick={() => void query.refetch()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh policy
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="space-y-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Password policy</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">Aligned with your account security requirements.</p>
            </div>

            <div className="space-y-2 rounded-[18px] border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span>Minimum length</span>
                <span className="text-slate-950 dark:text-white">{policy.minLength} characters</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span>Uppercase required</span>
                <span className={policy.requiresUppercase ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500'}>{policy.requiresUppercase ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span>Number required</span>
                <span className={policy.requiresNumber ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500'}>{policy.requiresNumber ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span>Symbol required</span>
                <span className={policy.requiresSymbol ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500'}>{policy.requiresSymbol ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span>Password reuse window</span>
                <span className="text-slate-950 dark:text-white">{policy.allowReuseAfterDays} days</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span>Last changed</span>
                <span className="text-slate-950 dark:text-white">{formatDate(policy.lastChangedAt)}</span>
              </div>
            </div>

            <div className="rounded-[18px] border border-cyan-200 bg-cyan-50 p-3 dark:border-cyan-400/20 dark:bg-cyan-400/10">
              <div className="flex items-center gap-2 text-sm font-medium text-cyan-700 dark:text-cyan-200">
                <Sparkles className="h-4 w-4" />
                Strength meter
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div className={`h-full rounded-full ${passwordStrength.tone}`} style={{ width: passwordStrength.width }} />
              </div>
              <p className="mt-2 text-sm text-cyan-700 dark:text-cyan-100">{passwordStrength.label}</p>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="space-y-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Update password</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">Use the same password only if it satisfies the current policy.</p>
            </div>

            {formMessage ? <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">{formMessage}</div> : null}
            {formError ? <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">{formError}</div> : null}

            <div className="space-y-3">
              <PasswordInput
                label="Current password"
                value={currentPassword}
                onChange={setCurrentPassword}
                visible={showCurrent}
                onToggle={() => setShowCurrent((value) => !value)}
              />
              <PasswordInput
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                visible={showNew}
                onToggle={() => setShowNew((value) => !value)}
              />
              <PasswordInput
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                visible={showConfirm}
                onToggle={() => setShowConfirm((value) => !value)}
              />
            </div>

            <div className="rounded-[18px] border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              Make sure you are not reusing an old password. A fresh password reduces account takeover risk.
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" />
              {mutation.isPending ? 'Updating password...' : 'Update password'}
            </button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

type PasswordInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
};

function PasswordInput({ label, value, onChange, visible, onToggle }: PasswordInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-950 dark:text-white">{label}</label>
      <div className="relative">
        <Input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 rounded-xl border-slate-200 bg-white pr-11 text-sm text-slate-950 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:text-slate-950 dark:hover:text-white"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
