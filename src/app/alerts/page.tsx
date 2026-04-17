'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  createAlert,
  deleteAlert,
  getAlertById,
  getAlertEvaluatorStatus,
  getAlerts,
  updateAlert,
} from '@/api/api';

type AlertRecord = {
  id: string;
  symbol: string;
  alertType: string;
  targetValue: number;
  isActive: boolean;
  createdAt?: string;
};

const ALERT_TYPES = [
  'price_above',
  'price_below',
  'percent_change_up',
  'percent_change_down',
  'volume_spike',
  'daily_change',
];

export default function AlertsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [selectedAlertDetails, setSelectedAlertDetails] = useState<Record<string, unknown> | null>(null);
  const [schedulerStatus, setSchedulerStatus] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [symbol, setSymbol] = useState('');
  const [alertType, setAlertType] = useState('price_above');
  const [targetValue, setTargetValue] = useState('');

  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || '')).reverse();
  }, [alerts]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const [alertsResponse, statusResponse] = await Promise.all([
        getAlerts(),
        getAlertEvaluatorStatus(),
      ]);

      const alertsPayload = alertsResponse?.data?.alerts || alertsResponse?.alerts || [];
      const schedulerPayload = statusResponse?.data?.scheduler || statusResponse?.scheduler || null;

      const normalizedAlerts = Array.isArray(alertsPayload) ? alertsPayload : [];

      setAlerts(normalizedAlerts);
      setSchedulerStatus(schedulerPayload);

      if (normalizedAlerts.length > 0 && normalizedAlerts[0]?.id) {
        try {
          const detailResponse = await getAlertById(String(normalizedAlerts[0].id));
          const detailPayload = detailResponse?.data?.alert || detailResponse?.alert || detailResponse?.data || detailResponse;
          setSelectedAlertDetails(
            detailPayload && typeof detailPayload === 'object'
              ? (detailPayload as Record<string, unknown>)
              : null
          );
        } catch {
          setSelectedAlertDetails(null);
        }
      } else {
        setSelectedAlertDetails(null);
      }

      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    void loadAlerts();
  }, [isAuthenticated]);

  const handleCreateAlert = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!symbol.trim() || !targetValue.trim()) {
      setError('Symbol and target value are required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      await createAlert({
        symbol: symbol.trim().toUpperCase(),
        alertType,
        targetValue: Number(targetValue),
      });

      setSymbol('');
      setTargetValue('');
      await loadAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (alert: AlertRecord) => {
    try {
      await updateAlert(alert.id, { isActive: !alert.isActive });
      await loadAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update alert');
    }
  };

  const handleDelete = async (alertId: string) => {
    try {
      await deleteAlert(alertId);
      await loadAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete alert');
    }
  };

  if (authLoading) {
    return <div className="container mx-auto px-4 py-10 text-gray-300">Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto bg-gray-900/90 border border-gray-700/50 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Price Alerts</h1>
          <p className="text-gray-300 mb-4">Please log in to create and manage stock alerts.</p>
          <Link href="/auth/login" className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Alerts</h1>
        <p className="text-gray-400 mt-1">Create and track price movement alerts in real-time.</p>
      </div>

      {error ? (
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 text-red-300 text-sm">{error}</div>
      ) : null}

      <div className="bg-gray-900/90 border border-gray-700/50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Create Alert</h2>
        <form onSubmit={handleCreateAlert} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Symbol (e.g., RELIANCE)"
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
          />
          <select
            value={alertType}
            onChange={(e) => setAlertType(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
          >
            {ALERT_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder="Target value"
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm rounded-md px-3 py-2"
          >
            {saving ? 'Creating...' : 'Create Alert'}
          </button>
        </form>
      </div>

      <div className="bg-gray-900/90 border border-gray-700/50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-2">Evaluator Status</h2>
        <pre className="text-xs text-gray-300 bg-gray-800 border border-gray-700 rounded-md p-3 overflow-x-auto">
          {JSON.stringify(schedulerStatus, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-900/90 border border-gray-700/50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-2">Alert Detail Preview</h2>
        <p className="text-xs text-gray-400 mb-3">Loads the first alert via GET /alerts/:alertId to validate detail endpoint mapping.</p>
        <pre className="text-xs text-gray-300 bg-gray-800 border border-gray-700 rounded-md p-3 overflow-x-auto">
          {JSON.stringify(selectedAlertDetails, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-900/90 border border-gray-700/50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Your Alerts</h2>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading alerts...</p>
        ) : sortedAlerts.length === 0 ? (
          <p className="text-gray-400 text-sm">No alerts created yet.</p>
        ) : (
          <div className="space-y-3">
            {sortedAlerts.map((alert) => (
              <div key={alert.id} className="border border-gray-700 rounded-lg p-3 bg-gray-800/60">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-white font-medium">{alert.symbol}</p>
                    <p className="text-xs text-gray-400">
                      {alert.alertType} @ ₹{Number(alert.targetValue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handleToggleActive(alert)}
                      className={`text-xs px-2 py-1 rounded border ${
                        alert.isActive
                          ? 'bg-green-900/30 text-green-300 border-green-700'
                          : 'bg-gray-700 text-gray-300 border-gray-600'
                      }`}
                    >
                      {alert.isActive ? 'Active' : 'Paused'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(alert.id)}
                      className="text-xs px-2 py-1 rounded border border-red-700 bg-red-900/30 text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
