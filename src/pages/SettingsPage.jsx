import React from 'react';
import SettingsPanel from '../components/settings/SettingsPanel';
import ThemeWrapper from '../components/ThemeWrapper';


/**
 * SettingsPage - User settings and preferences page.
 *
 * Features:
 * - Displays user settings panel for updating preferences.
 * - Uses ThemeWrapper for consistent theming.
 * - Responsive and accessible layout.
 */
export default function SettingsPage() {
  return (
    <ThemeWrapper className="container mx-auto py-6 px-4">
      {/* Page header */}
      <h1 className="text-2xl font-bold mb-6" aria-label="User Settings">User Settings</h1>
      {/* SettingsPanel: Main settings form and controls */}
      <SettingsPanel isAdmin={false} />
    </ThemeWrapper>
  );
}
