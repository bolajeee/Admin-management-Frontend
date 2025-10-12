import { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export function useSettings({ userId = null, initialSettings = null } = {}) {
  const authUser = useAuthStore((state) => state.authUser);
  const [settings, setSettings] = useState(initialSettings || {
    notifications: {
      email: true,
      browser: true,
      sms: false
    },
    privacy: {
      showOnlineStatus: true,
      showReadReceipts: true
    },
    system: {
      autoUserCleanup: false,
      dailyBackups: true,
      maintenanceMode: false
    }
  });
  const [isLoading, setIsLoading] = useState(!initialSettings);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch user settings (only if not provided)
  useEffect(() => {
    if (!authUser || initialSettings) return;
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/settings');
        setSettings(response.data.data || settings);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        setError("Failed to load your settings. Please try again later.");
        toast.error("Failed to load your settings.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [authUser, initialSettings]);

  // Update a specific setting
  const updateSetting = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  // Save all settings
  const saveSettings = async () => {
    if (!authUser && !userId) return;
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    const toastId = toast.loading('Saving settings...');
    try {
      // Only send allowed keys for user settings
      const allowed = ['notifications', 'privacy'];
      const payload = Object.fromEntries(
        Object.entries(settings).filter(([key]) => allowed.includes(key))
      );
      if (userId) {
        await axiosInstance.patch(`/settings/${userId}`, payload);
      } else {
        await axiosInstance.patch('/settings', payload);
      }
      setSaveSuccess(true);
      toast.success('Settings saved successfully!', { id: toastId });
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setError("Failed to save your settings. Please try again later.");
      toast.error("Failed to save your settings.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    updateSetting,
    saveSettings,
    isLoading,
    error,
    isSaving,
    saveSuccess
  };
}