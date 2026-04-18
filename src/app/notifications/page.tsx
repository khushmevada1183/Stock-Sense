'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  deletePushDevice,
  getNotificationDeliveryStatus,
  getNotifications,
  getPushDevices,
  registerPushDevice,
} from '@/api/api';

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
        Array.isArray(notifResponse?.data?.notifications)
          ? notifResponse.data.notifications
          : []
      );
      const deviceList = Array.isArray(deviceResponse?.data?.devices)
        ? deviceResponse.data.devices
        : [];

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
    return <div className="container mx-auto px-4 py-10 text-gray-300">Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto bg-gray-900/90 border border-gray-700/50 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-gray-300 mb-4">Please log in to view and manage notifications.</p>
          <Link href="/login" className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Notifications</h1>
        <p className="text-gray-400 mt-1">Manage your notification center and push device settings.</p>
      </div>

      {error ? (
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 text-red-300 text-sm">{error}</div>
      ) : null}

      <div className="bg-gray-900/90 border border-gray-700/50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-2">Delivery Scheduler</h2>
        <pre className="text-xs text-gray-300 bg-gray-800 border border-gray-700 rounded-md p-3 overflow-x-auto">
          {JSON.stringify(scheduler, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-900/90 border border-gray-700/50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Register Push Device</h2>
        <form onSubmit={handleRegisterDevice} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
          >
            <option value="webpush">webpush</option>
            <option value="fcm">fcm</option>
            <option value="expo">expo</option>
            <option value="apns">apns</option>
            <option value="mock">mock</option>
          </select>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
          >
            <option value="web">web</option>
            <option value="ios">ios</option>
            <option value="android">android</option>
            <option value="unknown">unknown</option>
          </select>
          <input
            value={deviceToken}
            onChange={(e) => setDeviceToken(e.target.value)}
            placeholder="Device token"
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
          />
          <button
            type="submit"
            disabled={registering}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm rounded-md px-3 py-2"
          >
            {registering ? 'Registering...' : 'Register Device'}
          </button>
        </form>
      </div>

      <div className="bg-gray-900/90 border border-gray-700/50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Registered Devices</h2>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading devices...</p>
        ) : devices.length === 0 ? (
          <p className="text-gray-400 text-sm">No push devices registered.</p>
        ) : (
          <div className="space-y-2">
            {devices.map((device) => (
              <div key={device.id} className="border border-gray-700 rounded-lg p-3 bg-gray-800/60 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{device.provider} • {device.platform}</p>
                  <p className="text-xs text-gray-400">{device.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDeleteDevice(device.id)}
                  className="text-xs px-2 py-1 rounded border border-red-700 bg-red-900/30 text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-900/90 border border-gray-700/50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Notification Center</h2>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-400 text-sm">No notifications yet.</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div key={notification.id} className="border border-gray-700 rounded-lg p-3 bg-gray-800/60">
                <p className="text-white text-sm font-medium">{notification.title || 'Notification'}</p>
                <p className="text-gray-300 text-sm mt-1">{notification.message || 'No message body available.'}</p>
                <p className="text-xs text-gray-500 mt-2">{notification.createdAt || ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
