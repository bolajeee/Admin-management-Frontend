import React from 'react';
import { useThemeStore } from '../../store/useThemeStore';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { THEMES, THEME_COLORS } from '../../constants';
import { useSettings } from '../../hooks/useSettings';
import { Check, Moon, Sun, RefreshCw, AlertCircle } from 'lucide-react';

const SettingsPanel = ({ isAdmin = false, userId = null, initialSettings = null }) => {
  const { theme, setTheme } = useThemeStore();
  const {
    settings,
    updateSetting,
    saveSettings,
    isLoading,
    error,
    isSaving,
    saveSuccess
  } = useSettings({ userId, initialSettings });
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="alert alert-error">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {THEMES.map((themeName) => (
              <button
                key={themeName}
                onClick={() => handleThemeChange(themeName)}
                className={`
                  p-3 rounded-lg flex items-center gap-2 transition-colors
                  ${theme === themeName ? 'bg-primary text-primary-content' : 'bg-base-200 hover:bg-base-300'}
                `}
              >
                {themeName === 'light' ? (
                  <Sun className="h-5 w-5" />
                ) : themeName === 'dark' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <div
                    className="h-5 w-5 rounded-full"
                    style={{ backgroundColor: THEME_COLORS[themeName].primary }}
                  />
                )}
                <span className="capitalize">{themeName}</span>
                {theme === themeName && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium">Email Notifications</h3>
                <p className="text-sm text-base-content/60">Receive updates via email</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.notifications?.email || false}
                onChange={() => updateSetting('notifications', 'email', !(settings.notifications?.email))}
                disabled={!settings.notifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium">Browser Notifications</h3>
                <p className="text-sm text-base-content/60">Show desktop notifications</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.notifications?.browser || false}
                onChange={() => updateSetting('notifications', 'browser', !(settings.notifications?.browser))}
                disabled={!settings.notifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium">SMS Notifications</h3>
                <p className="text-sm text-base-content/60">Receive urgent notifications via SMS</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.notifications?.sms || false}
                onChange={() => updateSetting('notifications', 'sms', !(settings.notifications?.sms))}
                disabled={!settings.notifications}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium">Online Status</h3>
                <p className="text-sm text-base-content/60">Show when you are online</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.privacy?.showOnlineStatus || false}
                onChange={() => updateSetting('privacy', 'showOnlineStatus', !(settings.privacy?.showOnlineStatus))}
                disabled={!settings.privacy}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium">Read Receipts</h3>
                <p className="text-sm text-base-content/60">Show when you have read messages</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.privacy?.showReadReceipts ?? false}
                onChange={() => updateSetting('privacy', 'showReadReceipts', !(settings.privacy?.showReadReceipts ?? false))}
                disabled={!settings.privacy}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin-only settings */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Defensive checks for settings.system */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium">Automatic User Cleanup</h3>
                  <p className="text-sm text-base-content/60">Remove inactive users after 90 days</p>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={settings.system?.autoUserCleanup || false}
                  onChange={() => updateSetting('system', 'autoUserCleanup', !(settings.system?.autoUserCleanup))}
                  disabled={!settings.system}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium">Daily Backups</h3>
                  <p className="text-sm text-base-content/60">Enable automatic daily backups</p>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={settings.system?.dailyBackups || false}
                  onChange={() => updateSetting('system', 'dailyBackups', !(settings.system?.dailyBackups))}
                  disabled={!settings.system}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium">Maintenance Mode</h3>
                  <p className="text-sm text-base-content/60">Put application in maintenance mode</p>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-error"
                  checked={settings.system?.maintenanceMode || false}
                  onChange={() => updateSetting('system', 'maintenanceMode', !(settings.system?.maintenanceMode))}
                  disabled={!settings.system}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          className="btn btn-primary"
          onClick={saveSettings}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <Check className="h-4 w-4" />
              Saved!
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;






