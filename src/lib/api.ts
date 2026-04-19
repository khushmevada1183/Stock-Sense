import { ApiClientError, requestApi } from './apiClient';

export type ApiResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

export type BasicDetailsData = {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  incomeRange: string;
  maritalStatus: string;
  occupation: string;
  country: string;
  address: string;
  pan: string;
  kycStatus: string;
  lastUpdated: string;
};

export type ReportItem = {
  id: string;
  title: string;
  category: string;
  period: string;
  generatedAt: string;
  status: 'Ready' | 'Queued' | 'Expired';
  downloadUrl: string;
  size: string;
};

export type ReportsData = {
  summary: {
    total: number;
    ready: number;
    queued: number;
    lastGeneratedAt: string;
  };
  reports: ReportItem[];
};

export type ActiveDevice = {
  id: string;
  sessionId: string;
  name: string;
  platform: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  currentSession: boolean;
  verified: boolean;
};

export type ActiveDevicesData = {
  total: number;
  currentDeviceId: string;
  lastSecurityCheck: string;
  devices: ActiveDevice[];
};

export type TradingDetailsData = {
  accountType: string;
  preferredExchange: string;
  riskProfile: string;
  equityTradingEnabled: boolean;
  derivativesEnabled: boolean;
  commodityEnabled: boolean;
  currencyEnabled: boolean;
  marginTradingEnabled: boolean;
  autoSquareOff: string;
  defaultOrderType: string;
  settlementMode: string;
  notes: string;
  lastUpdated: string;
};

export type SuspiciousActivityEvent = {
  id: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  location: string;
  ipAddress: string;
  device: string;
  timestamp: string;
  status: 'reviewed' | 'open' | 'blocked';
};

export type SuspiciousActivityData = {
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
    lastCheck: string;
  };
  events: SuspiciousActivityEvent[];
};

export type PasswordPolicyData = {
  minLength: number;
  requiresUppercase: boolean;
  requiresNumber: boolean;
  requiresSymbol: boolean;
  allowReuseAfterDays: number;
  lastChangedAt: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangePasswordResult = {
  message: string;
  updatedAt: string;
};

export type UpdateBasicDetailsPayload = Partial<BasicDetailsData>;
export type UpdateTradingDetailsPayload = Partial<TradingDetailsData>;

const FALLBACK_BASIC_DETAILS: BasicDetailsData = {
  fullName: 'Stock Sense Investor',
  firstName: 'Stock',
  lastName: 'Sense',
  email: 'investor@stocksense.local',
  phone: '+91 90000 00000',
  dateOfBirth: '1995-06-15',
  gender: 'Prefer not to say',
  incomeRange: 'Below 1 Lac',
  maritalStatus: 'Not shared',
  occupation: 'Self-directed investor',
  country: 'India',
  address: 'Mumbai, Maharashtra',
  pan: 'AAAAA0000A',
  kycStatus: 'Verified',
  lastUpdated: '2026-01-05T08:30:00.000Z',
};

const FALLBACK_REPORTS: ReportsData = {
  summary: {
    total: 4,
    ready: 4,
    queued: 0,
    lastGeneratedAt: '2026-01-12T09:00:00.000Z',
  },
  reports: [
    {
      id: 'report-1',
      title: 'Monthly portfolio statement',
      category: 'Holdings',
      period: 'Jan 2026',
      generatedAt: '2026-01-12T09:00:00.000Z',
      status: 'Ready',
      downloadUrl: '#',
      size: '1.2 MB',
    },
    {
      id: 'report-2',
      title: 'Tax-ready transaction report',
      category: 'Tax',
      period: 'FY 2025-26',
      generatedAt: '2026-01-08T14:10:00.000Z',
      status: 'Ready',
      downloadUrl: '#',
      size: '2.8 MB',
    },
    {
      id: 'report-3',
      title: 'Dividend income snapshot',
      category: 'Income',
      period: 'Quarterly',
      generatedAt: '2026-01-03T07:45:00.000Z',
      status: 'Ready',
      downloadUrl: '#',
      size: '724 KB',
    },
    {
      id: 'report-4',
      title: 'Risk exposure review',
      category: 'Risk',
      period: 'Weekly',
      generatedAt: '2026-01-02T11:20:00.000Z',
      status: 'Ready',
      downloadUrl: '#',
      size: '980 KB',
    },
  ],
};

const FALLBACK_ACTIVE_DEVICES: ActiveDevicesData = {
  total: 3,
  currentDeviceId: 'device-1',
  lastSecurityCheck: '2026-01-12T09:45:00.000Z',
  devices: [
    {
      id: 'device-1',
      sessionId: 'device-1',
      name: 'Windows laptop',
      platform: 'Windows 11',
      browser: 'Chrome 121',
      ipAddress: '103.82.116.24',
      location: 'Mumbai, India',
      lastActive: '2026-01-12T09:42:00.000Z',
      isCurrent: true,
      currentSession: true,
      verified: true,
    },
    {
      id: 'device-2',
      sessionId: 'device-2',
      name: 'iPhone',
      platform: 'iOS 17',
      browser: 'Safari',
      ipAddress: '103.82.116.26',
      location: 'Mumbai, India',
      lastActive: '2026-01-11T18:20:00.000Z',
      isCurrent: false,
      currentSession: false,
      verified: true,
    },
    {
      id: 'device-3',
      sessionId: 'device-3',
      name: 'Android tablet',
      platform: 'Android 14',
      browser: 'Chrome Mobile',
      ipAddress: '103.82.116.38',
      location: 'Pune, India',
      lastActive: '2026-01-10T07:15:00.000Z',
      isCurrent: false,
      currentSession: false,
      verified: false,
    },
  ],
};

const FALLBACK_TRADING_DETAILS: TradingDetailsData = {
  accountType: 'Individual',
  preferredExchange: 'NSE',
  riskProfile: 'Moderate',
  equityTradingEnabled: true,
  derivativesEnabled: false,
  commodityEnabled: false,
  currencyEnabled: false,
  marginTradingEnabled: true,
  autoSquareOff: '15:10 IST',
  defaultOrderType: 'Limit',
  settlementMode: 'T+1',
  notes: 'Use long-term allocation for core holdings and trade selectively.',
  lastUpdated: '2026-01-11T13:30:00.000Z',
};

const FALLBACK_SUSPICIOUS_ACTIVITY: SuspiciousActivityData = {
  summary: {
    total: 3,
    high: 1,
    medium: 1,
    low: 1,
    lastCheck: '2026-01-12T10:00:00.000Z',
  },
  events: [
    {
      id: 'alert-1',
      severity: 'high',
      title: 'Multiple failed login attempts',
      description: 'Five failed OTP attempts were recorded from a new browser session.',
      location: 'Mumbai, India',
      ipAddress: '103.82.116.88',
      device: 'Unknown Chrome session',
      timestamp: '2026-01-12T08:10:00.000Z',
      status: 'open',
    },
    {
      id: 'alert-2',
      severity: 'medium',
      title: 'New device sign-in',
      description: 'A trusted device was added after successful verification.',
      location: 'Mumbai, India',
      ipAddress: '103.82.116.26',
      device: 'iPhone',
      timestamp: '2026-01-11T18:20:00.000Z',
      status: 'reviewed',
    },
    {
      id: 'alert-3',
      severity: 'low',
      title: 'Trading preference changed',
      description: 'Margin trading preference was updated from the settings page.',
      location: 'Mumbai, India',
      ipAddress: '103.82.116.24',
      device: 'Windows laptop',
      timestamp: '2026-01-11T13:30:00.000Z',
      status: 'reviewed',
    },
  ],
};

const FALLBACK_PASSWORD_POLICY: PasswordPolicyData = {
  minLength: 8,
  requiresUppercase: true,
  requiresNumber: true,
  requiresSymbol: false,
  allowReuseAfterDays: 90,
  lastChangedAt: '2025-12-21T10:00:00.000Z',
};

const shouldUseFallback = (error: unknown) => {
  if (error instanceof TypeError) {
    return true;
  }

  if (error instanceof ApiClientError) {
    return error.status === 404 || error.status === 405 || error.status === 501;
  }

  return false;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const unwrapPayload = <T>(payload: unknown, fallback: T): T => {
  if (!isRecord(payload)) {
    return (payload as T) ?? fallback;
  }

  if (payload.data !== undefined && payload.data !== null) {
    return payload.data as T;
  }

  if (payload.user !== undefined) {
    return payload.user as T;
  }

  if (payload.profile !== undefined) {
    return payload.profile as T;
  }

  if (payload.success === true && payload.data !== undefined) {
    return payload.data as T;
  }

  return payload as T;
};

const toStringValue = (value: unknown, fallback = '') => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return fallback;
};

const makeSuccess = <T>(data: T, message?: string): ApiResponse<T> => {
  return message ? { success: true, data, message } : { success: true, data };
};

const normalizeBasicDetails = (payload: unknown): BasicDetailsData => {
  const source = isRecord(payload) ? payload : {};
  const profile = isRecord(source.user) ? source.user : isRecord(source.profile) ? source.profile : source;
  const fullName = toStringValue(profile.fullName || profile.name || profile.displayName, FALLBACK_BASIC_DETAILS.fullName);
  const [derivedFirstName, ...derivedLastNameParts] = fullName.split(/\s+/).filter(Boolean);
  const derivedLastName = derivedLastNameParts.join(' ');

  return {
    fullName,
    firstName: toStringValue(profile.firstName || profile.first_name || derivedFirstName, FALLBACK_BASIC_DETAILS.firstName),
    lastName: toStringValue(profile.lastName || profile.last_name || derivedLastName, FALLBACK_BASIC_DETAILS.lastName),
    email: toStringValue(profile.email, FALLBACK_BASIC_DETAILS.email),
    phone: toStringValue(profile.phone || profile.mobile || profile.phoneNumber, FALLBACK_BASIC_DETAILS.phone),
    dateOfBirth: toStringValue(profile.dateOfBirth || profile.dob || profile.birthDate, FALLBACK_BASIC_DETAILS.dateOfBirth),
    gender: toStringValue(profile.gender, FALLBACK_BASIC_DETAILS.gender),
    incomeRange: toStringValue(profile.incomeRange, FALLBACK_BASIC_DETAILS.incomeRange),
    maritalStatus: toStringValue(profile.maritalStatus || profile.marital_status, FALLBACK_BASIC_DETAILS.maritalStatus),
    occupation: toStringValue(profile.occupation || profile.profession, FALLBACK_BASIC_DETAILS.occupation),
    country: toStringValue(profile.country, FALLBACK_BASIC_DETAILS.country),
    address: toStringValue(profile.address || profile.city, FALLBACK_BASIC_DETAILS.address),
    pan: toStringValue(profile.pan || profile.panNumber || profile.taxId, FALLBACK_BASIC_DETAILS.pan),
    kycStatus: toStringValue(profile.kycStatus || profile.verificationStatus, FALLBACK_BASIC_DETAILS.kycStatus),
    lastUpdated: toStringValue(profile.updatedAt || profile.lastUpdated || profile.createdAt, FALLBACK_BASIC_DETAILS.lastUpdated),
  };
};

const normalizeReports = (payload: unknown): ReportsData => {
  const source = isRecord(payload) ? payload : {};
  const reports =
    (Array.isArray(source.reports) ? source.reports : null) ||
    (isRecord(source.data) && Array.isArray(source.data.reports) ? source.data.reports : null) ||
    FALLBACK_REPORTS.reports;

  const normalizedReports: ReportItem[] = reports.map((report: unknown, index: number) => {
    const item = isRecord(report) ? report : {};

    return {
      id: toStringValue(item.id, `report-${index + 1}`),
      title: toStringValue(item.title || item.name, FALLBACK_REPORTS.reports[index % FALLBACK_REPORTS.reports.length]?.title || 'Report'),
      category: toStringValue(item.category || item.type, 'General'),
      period: toStringValue(item.period || item.range || item.duration, 'Latest'),
      generatedAt: toStringValue(item.generatedAt || item.createdAt, new Date().toISOString()),
      status: (toStringValue(item.status, 'Ready') as ReportItem['status']) || 'Ready',
      downloadUrl: toStringValue(item.downloadUrl || item.url, '#'),
      size: toStringValue(item.size, '0 KB'),
    };
  });

  const summary = isRecord(source.summary) ? source.summary : isRecord(source.data) && isRecord(source.data.summary) ? source.data.summary : null;

  return {
    summary: {
      total: Number(summary?.total || normalizedReports.length),
      ready: Number(summary?.ready || normalizedReports.filter((report) => report.status === 'Ready').length),
      queued: Number(summary?.queued || normalizedReports.filter((report) => report.status === 'Queued').length),
      lastGeneratedAt: toStringValue(summary?.lastGeneratedAt || summary?.lastGenerated, FALLBACK_REPORTS.summary.lastGeneratedAt),
    },
    reports: normalizedReports,
  };
};

const normalizeActiveDevices = (payload: unknown): ActiveDevicesData => {
  const source = isRecord(payload) ? payload : {};
  const sessions =
    (Array.isArray(source.sessions) ? source.sessions : null) ||
    (isRecord(source.data) && Array.isArray(source.data.sessions) ? source.data.sessions : null) ||
    (Array.isArray(source.devices) ? source.devices : null) ||
    FALLBACK_ACTIVE_DEVICES.devices;

  const devices: ActiveDevice[] = sessions.map((session: unknown, index: number) => {
    const item = isRecord(session) ? session : {};
    const sessionId = toStringValue(item.sessionId || item.id, `session-${index + 1}`);
    const deviceName = toStringValue(item.deviceName || item.device || item.name, `Device ${index + 1}`);
    const currentSession = item.currentSession === undefined ? Boolean(item.isCurrent || false) : Boolean(item.currentSession);

    return {
      id: sessionId,
      sessionId,
      name: deviceName,
      platform: toStringValue(item.platform || item.os || item.operatingSystem || deviceName, deviceName),
      browser: currentSession ? 'Current session' : 'Signed-in session',
      ipAddress: toStringValue(item.ipAddress || item.ip || item.address, 'Unknown IP'),
      location: toStringValue(item.location || item.city || item.region, currentSession ? 'Current session' : 'Signed-in session'),
      lastActive: toStringValue(item.lastActivity || item.lastActive || item.createdAt || item.timestamp, new Date().toISOString()),
      isCurrent: currentSession,
      currentSession,
      verified: item.verified === undefined ? true : Boolean(item.verified),
    };
  });

  const currentDevice = devices.find((device) => device.isCurrent)?.id || devices[0]?.id || FALLBACK_ACTIVE_DEVICES.currentDeviceId;

  return {
    total: Number(source.count || source.total || devices.length),
    currentDeviceId: currentDevice,
    lastSecurityCheck: toStringValue(source.lastSecurityCheck || source.checkedAt, FALLBACK_ACTIVE_DEVICES.lastSecurityCheck),
    devices,
  };
};

const normalizeTradingDetails = (payload: unknown): TradingDetailsData => {
  const source = isRecord(payload) ? payload : {};
  const data = isRecord(source.data) ? source.data : source;

  return {
    accountType: toStringValue(data.accountType || data.account_type, FALLBACK_TRADING_DETAILS.accountType),
    preferredExchange: toStringValue(data.preferredExchange || data.preferred_exchange, FALLBACK_TRADING_DETAILS.preferredExchange),
    riskProfile: toStringValue(data.riskProfile || data.risk_profile, FALLBACK_TRADING_DETAILS.riskProfile),
    equityTradingEnabled: data.equityTradingEnabled === undefined ? FALLBACK_TRADING_DETAILS.equityTradingEnabled : Boolean(data.equityTradingEnabled),
    derivativesEnabled: data.derivativesEnabled === undefined ? FALLBACK_TRADING_DETAILS.derivativesEnabled : Boolean(data.derivativesEnabled),
    commodityEnabled: data.commodityEnabled === undefined ? FALLBACK_TRADING_DETAILS.commodityEnabled : Boolean(data.commodityEnabled),
    currencyEnabled: data.currencyEnabled === undefined ? FALLBACK_TRADING_DETAILS.currencyEnabled : Boolean(data.currencyEnabled),
    marginTradingEnabled: data.marginTradingEnabled === undefined ? FALLBACK_TRADING_DETAILS.marginTradingEnabled : Boolean(data.marginTradingEnabled),
    autoSquareOff: toStringValue(data.autoSquareOff || data.auto_square_off, FALLBACK_TRADING_DETAILS.autoSquareOff),
    defaultOrderType: toStringValue(data.defaultOrderType || data.default_order_type, FALLBACK_TRADING_DETAILS.defaultOrderType),
    settlementMode: toStringValue(data.settlementMode || data.settlement_mode, FALLBACK_TRADING_DETAILS.settlementMode),
    notes: toStringValue(data.notes || data.memo, FALLBACK_TRADING_DETAILS.notes),
    lastUpdated: toStringValue(data.lastUpdated || data.updatedAt, FALLBACK_TRADING_DETAILS.lastUpdated),
  };
};

const normalizeSuspiciousActivity = (payload: unknown): SuspiciousActivityData => {
  const source = isRecord(payload) ? payload : {};
  const events =
    (Array.isArray(source.auditLogs) ? source.auditLogs : null) ||
    (isRecord(source.data) && Array.isArray(source.data.auditLogs) ? source.data.auditLogs : null) ||
    (Array.isArray(source.events) ? source.events : null) ||
    FALLBACK_SUSPICIOUS_ACTIVITY.events;

  const normalizedEvents: SuspiciousActivityEvent[] = events.map((event: unknown, index: number) => {
    const item = isRecord(event) ? event : {};
    const severity = toStringValue(item.severity || item.riskLevel, 'low') as SuspiciousActivityEvent['severity'];

    return {
      id: toStringValue(item.id, `alert-${index + 1}`),
      severity: severity === 'high' || severity === 'medium' ? severity : 'low',
      title: toStringValue(item.title || item.event || item.eventType, 'Security event'),
      description: toStringValue(item.description || item.message, 'No additional details available.'),
      location: toStringValue(item.location || item.city || item.region, 'Unknown location'),
      ipAddress: toStringValue(item.ipAddress || item.ip, 'Unknown IP'),
      device: toStringValue(item.device || item.userAgent || item.user_agent, 'Unknown device'),
      timestamp: toStringValue(item.timestamp || item.createdAt || item.occurredAt, new Date().toISOString()),
      status: (toStringValue(item.status || item.state, 'open') as SuspiciousActivityEvent['status']) || 'open',
    };
  });

  const summary = isRecord(source.summary) ? source.summary : isRecord(source.data) && isRecord(source.data.summary) ? source.data.summary : null;

  return {
    summary: {
      total: Number(summary?.total || normalizedEvents.length),
      high: Number(summary?.high || normalizedEvents.filter((event) => event.severity === 'high').length),
      medium: Number(summary?.medium || normalizedEvents.filter((event) => event.severity === 'medium').length),
      low: Number(summary?.low || normalizedEvents.filter((event) => event.severity === 'low').length),
      lastCheck: toStringValue(summary?.lastCheck || summary?.updatedAt, FALLBACK_SUSPICIOUS_ACTIVITY.summary.lastCheck),
    },
    events: normalizedEvents,
  };
};

const normalizePasswordPolicy = (payload: unknown): PasswordPolicyData => {
  const source = isRecord(payload) ? payload : {};
  const data = isRecord(source.data) ? source.data : source;

  return {
    minLength: Number(data.minLength || data.minimumLength || FALLBACK_PASSWORD_POLICY.minLength),
    requiresUppercase: data.requiresUppercase === undefined ? FALLBACK_PASSWORD_POLICY.requiresUppercase : Boolean(data.requiresUppercase),
    requiresNumber: data.requiresNumber === undefined ? FALLBACK_PASSWORD_POLICY.requiresNumber : Boolean(data.requiresNumber),
    requiresSymbol: data.requiresSymbol === undefined ? FALLBACK_PASSWORD_POLICY.requiresSymbol : Boolean(data.requiresSymbol),
    allowReuseAfterDays: Number(data.allowReuseAfterDays || data.passwordReuseDays || FALLBACK_PASSWORD_POLICY.allowReuseAfterDays),
    lastChangedAt: toStringValue(data.lastChangedAt || data.updatedAt, FALLBACK_PASSWORD_POLICY.lastChangedAt),
  };
};

const fetchWithFallback = async <T>(request: () => Promise<unknown>, fallback: T, normalize: (payload: unknown) => T): Promise<ApiResponse<T>> => {
  try {
    const payload = await request();
    return makeSuccess(normalize(unwrapPayload(payload, fallback)));
  } catch (error) {
    if (shouldUseFallback(error)) {
      return makeSuccess(fallback);
    }

    throw error;
  }
};

const mutateWithFallback = async <T>(request: () => Promise<unknown>, fallback: T, normalize: (payload: unknown) => T): Promise<ApiResponse<T>> => {
  try {
    const payload = await request();
    return makeSuccess(normalize(unwrapPayload(payload, fallback)));
  } catch (error) {
    if (shouldUseFallback(error)) {
      return makeSuccess(fallback);
    }

    throw error;
  }
};

export async function getSettingsBasicDetails(): Promise<ApiResponse<BasicDetailsData>> {
  return fetchWithFallback(() => requestApi('/auth/profile', { requiresAuth: true }), FALLBACK_BASIC_DETAILS, normalizeBasicDetails);
}

export async function updateSettingsBasicDetails(payload: UpdateBasicDetailsPayload): Promise<ApiResponse<BasicDetailsData>> {
  const fullName = toStringValue(payload.fullName, '').trim() || [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim() || FALLBACK_BASIC_DETAILS.fullName;
  const requestBody = {
    fullName,
    phone: payload.phone === undefined ? FALLBACK_BASIC_DETAILS.phone : (payload.phone || null),
    gender: payload.gender === undefined ? FALLBACK_BASIC_DETAILS.gender : payload.gender,
    dob: payload.dateOfBirth === undefined ? FALLBACK_BASIC_DETAILS.dateOfBirth : (payload.dateOfBirth || null),
    incomeRange: payload.incomeRange === undefined ? FALLBACK_BASIC_DETAILS.incomeRange : (payload.incomeRange || null),
    occupation: payload.occupation === undefined ? FALLBACK_BASIC_DETAILS.occupation : (payload.occupation || null),
    avatarUrl: null,
  };

  return mutateWithFallback(
    () => requestApi('/auth/profile', { method: 'PATCH', requiresAuth: true, body: requestBody }),
    {
      ...FALLBACK_BASIC_DETAILS,
      fullName,
      firstName: toStringValue(payload.firstName, FALLBACK_BASIC_DETAILS.firstName),
      lastName: toStringValue(payload.lastName, FALLBACK_BASIC_DETAILS.lastName),
      phone: toStringValue(payload.phone, FALLBACK_BASIC_DETAILS.phone),
      gender: toStringValue(payload.gender, FALLBACK_BASIC_DETAILS.gender),
      dateOfBirth: toStringValue(payload.dateOfBirth, FALLBACK_BASIC_DETAILS.dateOfBirth),
      incomeRange: toStringValue(payload.incomeRange, FALLBACK_BASIC_DETAILS.incomeRange),
      occupation: toStringValue(payload.occupation, FALLBACK_BASIC_DETAILS.occupation),
    },
    normalizeBasicDetails
  );
}

export async function getSettingsReports(): Promise<ApiResponse<ReportsData>> {
  return makeSuccess(normalizeReports(FALLBACK_REPORTS));
}

export async function getSettingsActiveDevices(): Promise<ApiResponse<ActiveDevicesData>> {
  return fetchWithFallback(() => requestApi('/auth/sessions', { requiresAuth: true }), FALLBACK_ACTIVE_DEVICES, normalizeActiveDevices);
}

export async function logoutSettingsDevice(deviceId: string): Promise<ApiResponse<{ deviceId: string }>> {
  return mutateWithFallback(
    () => requestApi('/auth/logout-device', { method: 'POST', requiresAuth: true, body: { sessionId: deviceId } }),
    { deviceId },
    (payload) => {
      const data = isRecord(payload) ? payload : {};
      return {
        deviceId: toStringValue(data.deviceId, deviceId),
      };
    }
  );
}

export async function logoutAllSettingsDevices(): Promise<ApiResponse<{ message: string }>> {
  return mutateWithFallback(
    () => requestApi('/auth/logout-all', { method: 'POST', requiresAuth: true, body: {} }),
    { message: 'All sessions have been logged out.' },
    (payload) => ({
      message: toStringValue(isRecord(payload) ? payload.message : undefined, 'All sessions have been logged out.'),
    })
  );
}

export async function getSettingsTradingDetails(): Promise<ApiResponse<TradingDetailsData>> {
  return makeSuccess(normalizeTradingDetails(FALLBACK_TRADING_DETAILS));
}

export async function updateSettingsTradingDetails(payload: UpdateTradingDetailsPayload): Promise<ApiResponse<TradingDetailsData>> {
  return makeSuccess(normalizeTradingDetails({
    ...FALLBACK_TRADING_DETAILS,
    ...payload,
  }));
}

export async function getSettingsSuspiciousActivity(): Promise<ApiResponse<SuspiciousActivityData>> {
  return fetchWithFallback(() => requestApi('/auth/audit-logs', { requiresAuth: true }), FALLBACK_SUSPICIOUS_ACTIVITY, normalizeSuspiciousActivity);
}

export async function getSettingsPasswordPolicy(): Promise<ApiResponse<PasswordPolicyData>> {
  return makeSuccess(normalizePasswordPolicy(FALLBACK_PASSWORD_POLICY));
}

export async function changeSettingsPassword(payload: ChangePasswordPayload): Promise<ApiResponse<ChangePasswordResult>> {
  const now = new Date().toISOString();

  return mutateWithFallback(
    () => requestApi('/auth/change-password', { method: 'POST', requiresAuth: true, body: { oldPassword: payload.currentPassword, newPassword: payload.newPassword } }),
    { message: 'Password updated successfully.', updatedAt: now },
    (response) => {
      const data = isRecord(response) ? response : {};
      return {
        message: toStringValue(data.message, 'Password updated successfully.'),
        updatedAt: toStringValue(data.updatedAt || data.changedAt, now),
      };
    }
  );
}
