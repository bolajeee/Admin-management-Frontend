import React from 'react';
import SettingsPanel from '../../components/settings/SettingsPanel';

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
      <SettingsPanel isAdmin={true} />
    </div>
  );
}

