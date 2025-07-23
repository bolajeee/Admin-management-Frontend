import { useCallback, useEffect } from 'react';
import { message } from 'antd';
import { saveAs } from 'file-saver';
import useTeamPerformanceStore from '../store/useTeamPerformanceStore';

const useTeamPerformance = () => {
  // Get state and actions from the store
  const {
    data,
    loading,
    error,
    filters,
    setFilters,
    fetchData,
    exportData: storeExport,
    setupRealtimeUpdates
  } = useTeamPerformanceStore();

  // Wrapper for export with UI feedback
  const exportData = useCallback(async (format = 'csv') => {
    try {
      message.loading({ content: 'Preparing export...', key: 'export' });
      const blob = await storeExport(format);
      const filename = `team-performance-${new Date().toISOString().split('T')[0]}.${format}`;
      saveAs(blob, filename);
      message.success({ content: 'Export completed successfully!', key: 'export' });
    } catch (err) {
      console.error('Export failed:', err);
      message.error({ content: 'Export failed. Please try again.', key: 'export' });
    }
  }, [storeExport]);

  // Update filters and trigger data fetch
  const updateFilters = useCallback((newFilters) => {
    setFilters({
      ...newFilters,
      // Ensure we have a fresh timestamp for cache busting
      _t: Date.now()
    });
  }, [setFilters]);

  // Initial data fetch and setup real-time updates
  useEffect(() => {
    // Fetch initial data if we don't have it
    if (!data.performanceTrend?.length) {
      fetchData();
    }
    
    // Setup real-time updates
    setupRealtimeUpdates();
    
    // Cleanup function to unsubscribe from real-time updates
    return () => {
      // The store will handle the cleanup when the component unmounts
    };
  }, [fetchData, data.performanceTrend, setupRealtimeUpdates]);

  return {
    data,
    loading,
    error,
    filters,
    updateFilters,
    refresh: fetchData,
    exportData
  };
};

export default useTeamPerformance;
