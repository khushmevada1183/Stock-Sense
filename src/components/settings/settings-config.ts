import type { LucideIcon } from 'lucide-react';
import { FileText, Landmark, Laptop, LockKeyhole, ShieldAlert, User } from 'lucide-react';

export type SettingsTabId = 'basic' | 'reports' | 'devices' | 'password' | 'trading' | 'suspicious';

export type SettingsTabItem = {
  id: SettingsTabId;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const defaultSettingsTab: SettingsTabId = 'basic';

export const settingsTabs: SettingsTabItem[] = [
  { id: 'basic', label: 'Basic details', description: 'Personal profile and contact information', icon: User },
  { id: 'reports', label: 'Reports', description: 'Download statements and summaries', icon: FileText },
  { id: 'devices', label: 'Active devices', description: 'Monitor signed-in devices and sessions', icon: Laptop },
  { id: 'password', label: 'Change password', description: 'Update credentials and policy', icon: LockKeyhole },
  { id: 'trading', label: 'Trading details', description: 'Account preferences and market access', icon: Landmark },
  { id: 'suspicious', label: 'Suspicious activity', description: 'Review security alerts and risk signals', icon: ShieldAlert },
];

const settingsTabIds = new Set<SettingsTabId>(settingsTabs.map((tab) => tab.id));

export const isSettingsTabId = (value: string | null | undefined): value is SettingsTabId => {
  return Boolean(value) && settingsTabIds.has(value as SettingsTabId);
};
