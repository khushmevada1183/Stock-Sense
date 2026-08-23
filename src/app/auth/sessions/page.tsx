'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getAuthAuditLogs, getAuthSessions, logoutAll } from '@/api/api';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { dangerButtonClass, insetPanelClass, primaryButtonClass } from '@/styles/design-tokens';

type SessionItem = {
  id: string;
  deviceName?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt?: string;
  lastActivity?: string;
};

type AuditLogItem = {
  id: string;
  event?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: string;
};

export default function AuthSessionsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [sessionsResponse, logsResponse] = await Promise.all([
        getAuthSessions({ limit: 50 }),
        getAuthAuditLogs({ limit: 100 }),
      ]);

      const rawSessions = Array.isArray(sessionsResponse?.data?.sessions)
        ? sessionsResponse.data.sessions
        : [];
      const normalizedSessions: SessionItem[] = rawSessions.map((session: Record<string, unknown>) => ({
        id: String(session.id || session.sessionId || ''),
        deviceName:
          String(session.deviceName || session.device || '').trim() ||
          (String(session.userAgent || '').includes('Android')
            ? 'Android device'
            : String(session.userAgent || '').includes('iPhone')
              ? 'iPhone'
              : String(session.userAgent || '').includes('Windows')
                ? 'Windows device'
                : String(session.userAgent || '').includes('Macintosh')
                  ? 'Mac device'
                  : 'Active session'),
        userAgent: String(session.userAgent || session.user_agent || ''),
        ipAddress: String(session.ipAddress || session.ip || ''),
        createdAt: String(session.createdAt || session.created_at || ''),
        lastActivity: String(session.lastActivity || session.expiresAt || session.createdAt || ''),
      }));

      const rawLogs = Array.isArray(logsResponse?.data?.auditLogs)
        ? logsResponse.data.auditLogs
        : [];
      const normalizedLogs: AuditLogItem[] = rawLogs.map((log: Record<string, unknown>) => ({
        id: String(log.id || ''),
        event: String(log.event || log.eventType || log.type || 'auth_event'),
        ipAddress: String(log.ipAddress || log.ip || ''),
        userAgent: String(log.userAgent || log.user_agent || ''),
        timestamp: String(log.timestamp || log.createdAt || log.created_at || ''),
      }));

      setSessions(normalizedSessions.filter((session) => session.id));
      setLogs(normalizedLogs.filter((log) => log.id));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    void load();
  }, [isAuthenticated]);

  const handleLogoutAll = async () => {
    try {
      setBusy(true);
      await logoutAll();
      setSessions([]);
      setLogs([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout all sessions');
    } finally {
      setBusy(false);
    }
  };

  if (authLoading) {
    return (
      <AuthPageLayout title="Security sessions" description="Manage your active sessions and review sign-in history.">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading authentication…</p>
      </AuthPageLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthPageLayout title="Security sessions" description="Please sign in to view active sessions and audit logs.">
        <Link href="/login" className={`${primaryButtonClass} inline-flex`}>
          Go to sign in
        </Link>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout title="Security sessions" description="Manage your active sessions and review sign-in history.">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => void handleLogoutAll()}
          disabled={busy}
          className={dangerButtonClass}
        >
          {busy ? 'Logging out…' : 'Logout all devices'}
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Active sessions</h2>
        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading sessions…</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No active sessions available.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className={`${insetPanelClass} p-3`}>
                <p className="text-sm font-medium text-slate-950 dark:text-white">{session.deviceName || 'Unknown device'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {session.ipAddress || 'Unknown IP'} • {session.lastActivity || session.createdAt || ''}
                </p>
                <p className="mt-1 truncate text-xs text-slate-400 dark:text-slate-500">{session.userAgent || ''}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Audit logs</h2>
        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading audit logs…</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No audit events found.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className={`${insetPanelClass} p-3`}>
                <p className="text-sm font-medium text-slate-950 dark:text-white">{log.event || 'auth_event'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {log.ipAddress || 'Unknown IP'} • {log.timestamp || ''}
                </p>
                <p className="mt-1 truncate text-xs text-slate-400 dark:text-slate-500">{log.userAgent || ''}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </AuthPageLayout>
  );
}
