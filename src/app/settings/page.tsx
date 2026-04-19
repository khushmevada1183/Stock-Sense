import { Suspense } from 'react';
import SettingsPageShell from '@/components/settings/SettingsPageShell';

export const metadata = {
  title: 'Settings | Indian Stock Sense',
  description: 'Manage your profile, devices, reports, and trading preferences.',
};

function SettingsPageFallback() {
  return <div className="min-h-screen bg-[#07111a]" />;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageFallback />}>
      <SettingsPageShell />
    </Suspense>
  );
}
