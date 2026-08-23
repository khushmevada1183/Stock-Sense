'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  deletePushDevice,
  getNotificationDeliveryStatus,
  getNotifications,
  getPushDevices,
  registerPushDevice,
} from '@/api/api';
import {
  ToolAuthGate,
  ToolError,
  ToolLoading,
  ToolPageLayout,
  ToolPanel,
  fieldClass,
  primaryButtonClass,
} from '@/components/tools/ToolPageLayout';
import { dangerButtonClass, insetPanelClass } from '@/styles/design-tokens';

type NotificationItem = {
  id: string;
  title?: string;
  message?: string;
  createdAt?: string;
  status?: string;
};

type PushDevice = {
  id: string;
  provider: string;
  platform: string;
  isActive?: boolean;
  createdAt?: string;
};

export default function NotificationsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [devices, setDevices] = useState<PushDevice[]>([]);
  const [scheduler, setScheduler] = useState<Record<string, unknown> | null>(null);

  const [deviceToken, setDeviceToken] = useState('');
  const [platform, setPlatform] = useState('web');
  const [provider, setProvider] = useState('webpush');
  const [registering, setRegistering] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notifResponse, deviceResponse, statusResponse] = await Promise.all([
        getNotifications({ limit: 50 }),
        getPushDevices(),
        getNotificationDeliveryStatus(),
      ]);

      setNotifications(
        Array.isArray(notifResponse?.data?.notifications) ? notifResponse.data.notifications : [],
      );
      const deviceList = Array.isArray(deviceResponse?.data?.devices) ? deviceResponse.data.devices : [];

      setDevices(deviceList.filter((device: PushDevice) => device.isActive !== false));
      setScheduler(statusResponse?.data?.scheduler || null);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    void loadData();
  }, [isAuthenticated]);

  const handleRegisterDevice = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!deviceToken.trim()) {
      setError('Device token is required.');
      return;
    }

    try {
      setRegistering(true);
      setError('');
      await registerPushDevice({
        provider,
        platform,
        deviceToken: deviceToken.trim(),
      });
      setDeviceToken('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register push device');
    } finally {
      setRegistering(false);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      await deletePushDevice(deviceId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete device');
    }
  };

  if (authLoading) {
    return <ToolLoading message="Loading authentication…" />;
  }

  if (!isAuthenticated) {
    return (
      <ToolAuthGate
        title="Notifications"
        description="Sign in to view and manage your notification center."
      />
    );
  }

  return (
    <ToolPageLayout
      eyebrow="User tools"
      title="Notifications"
      description="Manage your notification center and push device settings."
    >
      {error ? <ToolError message={error} /> : null}

      <ToolPanel title="Delivery scheduler">
        <pre className={`${insetPanelClass} overflow-x-auto p-3 text-xs text-slate-600 dark:text-slate-300`}>
          {JSON.stringify(scheduler, null, 2)}
        </pre>
      </ToolPanel>

      <ToolPanel title="Register push device">
        <form onSubmit={handleRegisterDevice} className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <select value={provider} onChange={(e) => setProvider(e.target.value)} className={fieldClass}>
            <option value="webpush">webpush</option>
            <option value="fcm">fcm</option>
            <option value="expo">expo</option>
            <option value="apns">apns</option>
            <option value="mock">mock</option>
          </select>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={fieldClass}>
            <option value="web">web</option>
            <option value="ios">ios</option>
            <option value="android">android</option>
            <option value="unknown">unknown</option>
          </select>
          <input
            value={deviceToken}
            onChange={(e) => setDeviceToken(e.target.value)}
            placeholder="Device token"
            className={fieldClass}
          />
          <button type="submit" disabled={registering} className={primaryButtonClass}>
            {registering ? 'Registering…' : 'Register device'}
          </button>
        </form>
      </ToolPanel>

      <ToolPanel title="Registered devices">
        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading devices…</p>
        ) : devices.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No push devices registered.</p>
        ) : (
          <div className="space-y-2">
            {devices.map((device) => (
              <div key={device.id} className={`${insetPanelClass} flex items-center justify-between p-3`}>
                <div>
                  <p className="text-sm font-medium text-slate-950 dark:text-white">
                    {device.provider} • {device.platform}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{device.id}</p>
                </div>
                <button type="button" onClick={() => void handleDeleteDevice(device.id)} className={dangerButtonClass}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </ToolPanel>

      <ToolPanel title="Notification center">
        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading notifications…</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No notifications yet.</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div key={notification.id} className={`${insetPanelClass} p-3`}>
                <p className="text-sm font-medium text-slate-950 dark:text-white">
                  {notification.title || 'Notification'}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {notification.message || 'No message body available.'}
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{notification.createdAt || ''}</p>
              </div>
            ))}
          </div>
        )}
      </ToolPanel>
    </ToolPageLayout>
  );
}
