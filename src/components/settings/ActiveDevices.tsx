'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Laptop, LogOut, RefreshCw, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { ActiveDevice, getSettingsActiveDevices, logoutAllSettingsDevices, logoutSettingsDevice } from '@/lib/api';
import { toastApiError, toastApiSuccess } from '@/lib/toast';

const formatDistance = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const diff = Date.now() - parsed.getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.round(hours / 24)}d ago`;
};

const platformIcon = (platform: string) => {
  const value = platform.toLowerCase();
  if (value.includes('ios') || value.includes('android') || value.includes('iphone')) {
    return Smartphone;
  }

  return Laptop;
};

const cardTone = (device: ActiveDevice) =>
  device.isCurrent
    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-400/10'
    : device.verified
      ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
      : 'border-amber-200 bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/10';

export default function ActiveDevices() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['settings', 'active-devices'],
    queryFn: getSettingsActiveDevices,
  });

  const data = query.data?.data;

  const logoutDeviceMutation = useMutation({
    mutationFn: logoutSettingsDevice,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['settings', 'active-devices'] });
      toastApiSuccess(response, 'Device logged out successfully.');
    },
    onError: (error) => {
      toastApiError(error, 'Failed to log out selected device.');
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: logoutAllSettingsDevices,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['settings', 'active-devices'] });
      toastApiSuccess(response, response.data.message || 'All sessions have been logged out.');
    },
    onError: (error) => {
      toastApiError(error, 'Failed to log out all devices.');
    },
  });

  const devices = useMemo(() => data?.devices || [], [data?.devices]);

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-28 w-full rounded-[18px]" />
        <div className="space-y-3">
          <LoadingSkeleton className="h-24 w-full rounded-[18px]" />
          <LoadingSkeleton className="h-24 w-full rounded-[18px]" />
          <LoadingSkeleton className="h-24 w-full rounded-[18px]" />
        </div>
      </div>
    );
  }

  if (query.isError || !data) {
    return <div className="rounded-[20px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">Failed to load active devices.</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[24px] border border-slate-200 bg-white shadow-none transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="mt-0 text-xl text-slate-950 dark:text-white">Active devices</CardTitle>
              <CardDescription className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Review signed-in devices, track the current session, and revoke access from unknown browsers.
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void query.refetch()}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                type="button"
                disabled={logoutAllMutation.isPending}
                onClick={() => void logoutAllMutation.mutateAsync()}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-rose-400/20 dark:hover:bg-rose-500/10 dark:hover:text-rose-200"
              >
                <LogOut className="h-4 w-4" />
                {logoutAllMutation.isPending ? 'Logging out...' : 'Logout all'}
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Total devices</p>
              <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{data.total}</p>
            </div>
            <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Current device</p>
              <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">{data.currentDeviceId}</p>
            </div>
            <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Last security check</p>
              <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">{formatDistance(data.lastSecurityCheck)}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {devices.map((device) => {
              const DeviceIcon = platformIcon(device.platform);
              const pending = logoutDeviceMutation.isPending && logoutDeviceMutation.variables === device.id;

              return (
                <div key={device.id} className={`rounded-[18px] border p-3 transition hover:bg-slate-50 dark:hover:bg-slate-900 ${cardTone(device)}`}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                        <DeviceIcon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{device.name}</h3>
                        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                          {device.platform} • {device.browser}
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {device.location} • {device.ipAddress} • last active {formatDistance(device.lastActive)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => void logoutDeviceMutation.mutateAsync(device.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-rose-400/20 dark:hover:bg-rose-500/10 dark:hover:text-rose-200"
                    >
                      <LogOut className="h-4 w-4" />
                      {pending ? 'Logging out...' : 'Logout device'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {devices.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              No active devices were returned.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
