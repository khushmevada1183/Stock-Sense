'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  createAlert,
  deleteAlert,
  getAlertById,
  getAlertEvaluatorStatus,
  getAlerts,
  updateAlert,
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
import { dangerButtonClass, insetPanelClass, secondaryButtonClass } from '@/styles/design-tokens';

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
      const [alertsResponse, statusResponse] = await Promise.all([getAlerts(), getAlertEvaluatorStatus()]);

      const alertsPayload = alertsResponse?.data?.alerts || alertsResponse?.alerts || [];
      const schedulerPayload = statusResponse?.data?.scheduler || statusResponse?.scheduler || null;

      const normalizedAlerts = Array.isArray(alertsPayload) ? alertsPayload : [];

      setAlerts(normalizedAlerts);
      setSchedulerStatus(schedulerPayload);

      if (normalizedAlerts.length > 0 && normalizedAlerts[0]?.id) {
        try {
          const detailResponse = await getAlertById(String(normalizedAlerts[0].id));
          const detailPayload =
            detailResponse?.data?.alert || detailResponse?.alert || detailResponse?.data || detailResponse;
          setSelectedAlertDetails(
            detailPayload && typeof detailPayload === 'object'
              ? (detailPayload as Record<string, unknown>)
              : null,
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
    return <ToolLoading message="Loading authentication…" />;
  }

  if (!isAuthenticated) {
    return (
      <ToolAuthGate
        title="Price alerts"
        description="Sign in to create and manage stock movement alerts."
      />
    );
  }

  return (
    <ToolPageLayout
      eyebrow="User tools"
      title="Alerts"
      description="Create and track price movement alerts in real time."
    >
      {error ? <ToolError message={error} /> : null}

      <ToolPanel title="Create alert">
        <form onSubmit={handleCreateAlert} className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Symbol (e.g., RELIANCE)"
            className={fieldClass}
          />
          <select value={alertType} onChange={(e) => setAlertType(e.target.value)} className={fieldClass}>
            {ALERT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder="Target value"
            className={fieldClass}
          />
          <button type="submit" disabled={saving} className={primaryButtonClass}>
            {saving ? 'Creating…' : 'Create alert'}
          </button>
        </form>
      </ToolPanel>

      <ToolPanel title="Evaluator status">
        <pre className={`${insetPanelClass} overflow-x-auto p-3 text-xs text-slate-600 dark:text-slate-300`}>
          {JSON.stringify(schedulerStatus, null, 2)}
        </pre>
      </ToolPanel>

      <ToolPanel title="Alert detail preview">
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          Loads the first alert via GET /alerts/:alertId to validate detail endpoint mapping.
        </p>
        <pre className={`${insetPanelClass} overflow-x-auto p-3 text-xs text-slate-600 dark:text-slate-300`}>
          {JSON.stringify(selectedAlertDetails, null, 2)}
        </pre>
      </ToolPanel>

      <ToolPanel title="Your alerts">
        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading alerts…</p>
        ) : sortedAlerts.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No alerts created yet.</p>
        ) : (
          <div className="space-y-3">
            {sortedAlerts.map((alert) => (
              <div key={alert.id} className={`${insetPanelClass} p-3`}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-950 dark:text-white">{alert.symbol}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {alert.alertType} @ ₹
                      {Number(alert.targetValue).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handleToggleActive(alert)}
                      className={
                        alert.isActive
                          ? 'rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300'
                          : secondaryButtonClass + ' px-3 py-1 text-xs'
                      }
                    >
                      {alert.isActive ? 'Active' : 'Paused'}
                    </button>
                    <button type="button" onClick={() => void handleDelete(alert.id)} className={dangerButtonClass}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ToolPanel>
    </ToolPageLayout>
  );
}
