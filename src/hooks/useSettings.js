import { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from '../store/useAuthStore';

export function useSettings() {
  const authUser = useAuthStore((state) => state.authUser);
  const [settings, setSettings] = useState({
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
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch user settings
  useEffect(() => {
    if (!authUser) return;
    
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        // This endpoint would need to be implemented in the backend
        const response = await axiosInstance.get('/users/settings');
        setSettings(response.data || settings);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        setError("Failed to load your settings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [authUser]);

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
    if (!authUser) return;
    
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      // This endpoint would need to be implemented in the backend
      await axiosInstance.put('/users/settings', settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setError("Failed to save your settings. Please try again later.");
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