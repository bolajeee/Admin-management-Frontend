import React from 'react';
import SettingsPanel from '../components/settings/SettingsPanel';
import ThemeWrapper from '../components/ThemeWrapper';

export default function SettingsPage() {
  return (
    <ThemeWrapper className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">User Settings</h1>
      <SettingsPanel isAdmin={false} />
    </ThemeWrapper>
  );
}
