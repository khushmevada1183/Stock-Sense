const EMAIL_VERIFICATION_EMAIL_KEY = 'stock_sense_pending_email_verification_email';
const PASSWORD_RESET_SESSION_KEY = 'stock_sense_password_reset_session';

type PasswordResetSession = {
  email?: string | null;
  resetToken?: string | null;
  resetTokenExpiresAt?: string | null;
};

const canUseStorage = () => typeof window !== 'undefined';

const readSessionValue = (key: string): string | null => {
  if (!canUseStorage()) {
    return null;
  }

  return window.sessionStorage.getItem(key);
};

const writeSessionValue = (key: string, value: string | null) => {
  if (!canUseStorage()) {
    return;
  }

  if (value === null || value === '') {
    window.sessionStorage.removeItem(key);
    return;
  }

  window.sessionStorage.setItem(key, value);
};

const normalizeEmail = (email?: string | null) => String(email || '').trim().toLowerCase();

const normalizeToken = (token?: string | null) => String(token || '').trim();

const toIsoDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(String(value));
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return new Date(timestamp).toISOString();
};

const readPasswordResetSession = (): PasswordResetSession | null => {
  const rawValue = readSessionValue(PASSWORD_RESET_SESSION_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as PasswordResetSession;
    if (!parsedValue || typeof parsedValue !== 'object') {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
};

const writePasswordResetSession = (session: PasswordResetSession | null) => {
  if (!canUseStorage()) {
    return;
  }

  if (!session) {
    window.sessionStorage.removeItem(PASSWORD_RESET_SESSION_KEY);
    return;
  }

  const nextSession: PasswordResetSession = {};
  const email = normalizeEmail(session.email);
  const resetToken = normalizeToken(session.resetToken);
  const resetTokenExpiresAt = toIsoDate(session.resetTokenExpiresAt);

  if (email) {
    nextSession.email = email;
  }

  if (resetToken) {
    nextSession.resetToken = resetToken;
  }

  if (resetTokenExpiresAt) {
    nextSession.resetTokenExpiresAt = resetTokenExpiresAt;
  }

  if (!nextSession.email && !nextSession.resetToken && !nextSession.resetTokenExpiresAt) {
    window.sessionStorage.removeItem(PASSWORD_RESET_SESSION_KEY);
    return;
  }

  window.sessionStorage.setItem(PASSWORD_RESET_SESSION_KEY, JSON.stringify(nextSession));
};

const pruneExpiredPasswordResetSession = (session: PasswordResetSession | null): PasswordResetSession | null => {
  if (!session?.resetTokenExpiresAt) {
    return session;
  }

  const expiresAt = Date.parse(session.resetTokenExpiresAt);
  if (!Number.isFinite(expiresAt) || Date.now() < expiresAt) {
    return session;
  }

  const nextSession: PasswordResetSession = {
    email: session.email || null,
    resetToken: null,
    resetTokenExpiresAt: null,
  };

  writePasswordResetSession(nextSession);
  return nextSession;
};

export const savePendingEmailVerificationEmail = (email: string) => {
  const normalizedEmail = normalizeEmail(email);
  writeSessionValue(EMAIL_VERIFICATION_EMAIL_KEY, normalizedEmail || null);
};

export const getPendingEmailVerificationEmail = () => {
  return normalizeEmail(readSessionValue(EMAIL_VERIFICATION_EMAIL_KEY));
};

export const clearPendingEmailVerificationEmail = () => {
  writeSessionValue(EMAIL_VERIFICATION_EMAIL_KEY, null);
};

export const savePendingPasswordResetEmail = (email: string) => {
  const normalizedEmail = normalizeEmail(email);
  const currentSession = readPasswordResetSession();
  writePasswordResetSession({
    ...currentSession,
    email: normalizedEmail,
  });
};

export const getPendingPasswordResetEmail = () => {
  const session = pruneExpiredPasswordResetSession(readPasswordResetSession());
  return normalizeEmail(session?.email);
};

export const savePendingPasswordResetToken = ({
  resetToken,
  expiresAt,
}: {
  resetToken: string;
  expiresAt?: string | null;
}) => {
  const currentSession = readPasswordResetSession();
  writePasswordResetSession({
    ...currentSession,
    resetToken,
    resetTokenExpiresAt: expiresAt || null,
  });
};

export const getPendingPasswordResetToken = () => {
  const session = pruneExpiredPasswordResetSession(readPasswordResetSession());
  return normalizeToken(session?.resetToken);
};

export const clearPendingPasswordResetToken = () => {
  const currentSession = readPasswordResetSession();
  if (!currentSession) {
    return;
  }

  writePasswordResetSession({
    ...currentSession,
    resetToken: null,
    resetTokenExpiresAt: null,
  });
};

export const clearPendingPasswordResetSession = () => {
  writePasswordResetSession(null);
};
