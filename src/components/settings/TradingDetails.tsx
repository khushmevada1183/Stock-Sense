'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, RefreshCw, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { Input } from '@/components/ui/input';
import { TradingDetailsData, getSettingsTradingDetails, updateSettingsTradingDetails } from '@/lib/api';
import { toastApiError, toastApiSuccess } from '@/lib/toast';

const selectClasses =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white';

export default function TradingDetails() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['settings', 'trading-details'],
    queryFn: getSettingsTradingDetails,
  });

  const [draft, setDraft] = useState<TradingDetailsData | null>(null);

  const mutation = useMutation({
    mutationFn: updateSettingsTradingDetails,
    onSuccess: (response) => {
      queryClient.setQueryData(['settings', 'trading-details'], response);
      setDraft(null);
      toastApiSuccess(response, 'Trading preferences updated successfully.');
    },
    onError: (cause) => {
      toastApiError(cause, 'Failed to update trading preferences.');
    },
  });

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-32 w-full rounded-[18px]" />
        <div className="grid gap-4 xl:grid-cols-2">
          <LoadingSkeleton className="h-64 w-full rounded-[20px]" />
          <LoadingSkeleton className="h-64 w-full rounded-[20px]" />
        </div>
      </div>
    );
  }

  const formData = draft || query.data?.data;

  if (query.isError || !formData) {
    return <div className="rounded-[20px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">Failed to load trading details.</div>;
  }

  const updateValue = <K extends keyof TradingDetailsData>(key: K, value: TradingDetailsData[K]) => {
    setDraft((current) => {
      const base = current || formData;
      return base ? { ...base, [key]: value } : current;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData) {
      return;
    }

    await mutation.mutateAsync(formData);
  };

  return (
    <Card className="rounded-[24px] border border-slate-200 bg-white shadow-none transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="mt-0 text-xl text-slate-950 dark:text-white">Trading details</CardTitle>
            <CardDescription className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Configure market access, risk profile, and order preferences for the account.
            </CardDescription>
          </div>

          <button
            type="button"
            onClick={() => void query.refetch()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="space-y-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Market access</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">Turn trading segments on or off based on your preferences.</p>
            </div>

            <ToggleRow label="Equity trading" value={formData.equityTradingEnabled} onChange={(checked) => updateValue('equityTradingEnabled', checked)} />
            <ToggleRow label="Derivatives" value={formData.derivativesEnabled} onChange={(checked) => updateValue('derivativesEnabled', checked)} />
            <ToggleRow label="Commodity" value={formData.commodityEnabled} onChange={(checked) => updateValue('commodityEnabled', checked)} />
            <ToggleRow label="Currency" value={formData.currencyEnabled} onChange={(checked) => updateValue('currencyEnabled', checked)} />
            <ToggleRow label="Margin trading" value={formData.marginTradingEnabled} onChange={(checked) => updateValue('marginTradingEnabled', checked)} />

            <div className="rounded-[18px] border border-cyan-200 bg-cyan-50 p-3 dark:border-cyan-400/20 dark:bg-cyan-400/10">
              <div className="flex items-center gap-2 text-sm font-medium text-cyan-700 dark:text-cyan-200">
                <BadgeCheck className="h-4 w-4" />
                Risk summary
              </div>
              <p className="mt-2 text-sm leading-6 text-cyan-700 dark:text-cyan-100">
                {formData.riskProfile} risk profile with {formData.preferredExchange} as the preferred exchange.
              </p>
              <p className="mt-1.5 text-xs text-cyan-600 dark:text-cyan-100/80">Last updated {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(formData.lastUpdated))}</p>
            </div>
          </section>

          <section className="space-y-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Account details</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">Control default exchange, order type, and settlement behavior.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Account type">
                <select value={formData.accountType} onChange={(event) => updateValue('accountType', event.target.value)} className={selectClasses}>
                  {['Individual', 'Joint', 'HUF', 'Corporate'].map((option) => (
                    <option key={option} value={option} className="bg-slate-950">
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Preferred exchange">
                <select value={formData.preferredExchange} onChange={(event) => updateValue('preferredExchange', event.target.value)} className={selectClasses}>
                  {['NSE', 'BSE', 'NFO', 'MCX'].map((option) => (
                    <option key={option} value={option} className="bg-slate-950">
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Risk profile">
                <select value={formData.riskProfile} onChange={(event) => updateValue('riskProfile', event.target.value)} className={selectClasses}>
                  {['Conservative', 'Moderate', 'Growth', 'Aggressive'].map((option) => (
                    <option key={option} value={option} className="bg-slate-950">
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Default order type">
                <select value={formData.defaultOrderType} onChange={(event) => updateValue('defaultOrderType', event.target.value)} className={selectClasses}>
                  {['Market', 'Limit', 'SL', 'SL-M'].map((option) => (
                    <option key={option} value={option} className="bg-slate-950">
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Settlement mode">
                <Input value={formData.settlementMode} onChange={(event) => updateValue('settlementMode', event.target.value)} className="h-12 rounded-2xl border-white/10 bg-slate-950/80 text-sm text-white" />
              </Field>

              <Field label="Auto square-off">
                <Input value={formData.autoSquareOff} onChange={(event) => updateValue('autoSquareOff', event.target.value)} className="h-12 rounded-2xl border-white/10 bg-slate-950/80 text-sm text-white" />
              </Field>
            </div>

            <Field label="Notes">
              <textarea
                value={formData.notes}
                onChange={(event) => updateValue('notes', event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </Field>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {mutation.isPending ? 'Saving preferences...' : 'Save trading preferences'}
            </button>
          </section>
        </form>
      </CardContent>
    </Card>
  );
}

type ToggleRowProps = {
  label: string;
  value: boolean;
  onChange: (checked: boolean) => void;
};

function ToggleRow({ label, value, onChange }: ToggleRowProps) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 bg-white text-emerald-500 focus:ring-emerald-400/40 dark:border-slate-700 dark:bg-slate-900"
      />
    </label>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm font-medium text-slate-950 dark:text-white">{label}</span>
      {children}
    </label>
  );
}
