'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getAuthAuditLogs, getAuthSessions, logoutAll } from '@/api/api';

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
    return <div className="auth-shell container mx-auto min-h-screen px-4 py-10 text-gray-300">Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-shell container mx-auto min-h-screen px-4 py-10">
        <div className="auth-panel max-w-2xl mx-auto bg-gray-900/90 border border-gray-700/50 rounded-xl p-6">
          <h1 className="auth-title text-2xl font-bold text-white mb-2">Security Sessions</h1>
          <p className="auth-copy text-gray-300 mb-4">Please log in to view active sessions and audit logs.</p>
          <Link href="/login" className="auth-button-primary px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell container mx-auto min-h-screen px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="auth-title text-3xl font-bold text-white">Security Sessions</h1>
          <p className="auth-copy text-gray-400 mt-1">Manage your active sessions and review sign-in history.</p>
        </div>
        <button
          type="button"
          onClick={() => void handleLogoutAll()}
          disabled={busy}
          className="px-3 py-2 rounded-md border border-red-700 bg-red-900/30 text-red-300 text-sm disabled:opacity-50"
        >
          {busy ? 'Logging out...' : 'Logout All Devices'}
        </button>
      </div>

      {error ? (
        <div className="auth-feedback-error bg-red-900/20 border border-red-700/50 rounded-lg p-3 text-red-300 text-sm">{error}</div>
      ) : null}

      <div className="auth-panel bg-gray-900/90 border border-gray-700/50 rounded-xl p-5">
        <h2 className="auth-title text-lg font-semibold text-white mb-4">Active Sessions</h2>
        {loading ? (
          <p className="auth-copy text-gray-400 text-sm">Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p className="auth-copy text-gray-400 text-sm">No active sessions available.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className="auth-panel border border-gray-700 rounded-lg p-3 bg-gray-800/60">
                <p className="auth-title text-white text-sm font-medium">{session.deviceName || 'Unknown device'}</p>
                <p className="auth-copy text-xs text-gray-400">{session.ipAddress || 'Unknown IP'} • {session.lastActivity || session.createdAt || ''}</p>
                <p className="auth-muted text-xs text-gray-500 mt-1 truncate">{session.userAgent || ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="auth-panel bg-gray-900/90 border border-gray-700/50 rounded-xl p-5">
        <h2 className="auth-title text-lg font-semibold text-white mb-4">Audit Logs</h2>
        {loading ? (
          <p className="auth-copy text-gray-400 text-sm">Loading audit logs...</p>
        ) : logs.length === 0 ? (
          <p className="auth-copy text-gray-400 text-sm">No audit events found.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="auth-panel border border-gray-700 rounded-lg p-3 bg-gray-800/60">
                <p className="auth-title text-white text-sm font-medium">{log.event || 'auth_event'}</p>
                <p className="auth-copy text-xs text-gray-400">{log.ipAddress || 'Unknown IP'} • {log.timestamp || ''}</p>
                <p className="auth-muted text-xs text-gray-500 mt-1 truncate">{log.userAgent || ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
