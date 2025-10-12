import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import reportService from '../services/reportService';
import { useEffect } from 'react';

const initialState = {
  // Data state
  data: {
    metrics: {},
    performanceTrend: [],
    teamSkills: [],
    velocityData: [],
    satisfactionData: [],
    codeQualityMetrics: {}
  },
  // UI state
  loading: false,
  error: null,
  filters: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    team: 'all'
  }
};

const useTeamPerformanceStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        // Real-time subscription reference
        _subscription: null,
        
        // Actions
        // setFilters: (newFilters) => {
        //   set({ 
        //     filters: { ...get().filters, ...newFilters },
        //     loading: true
        //   });
        //   get().fetchData();
        // },
        
        // fetchData: async () => {
        //   try {
        //     set({ loading: true, error: null });
        //     const response = await reportService.getTeamPerformance(get().filters);
        //     set({ 
        //       data: response,
        //       loading: false 
        //     });
        //   } catch (error) {
        //     console.error('Failed to fetch team performance data:', error);
        //     set({ 
        //       error: 'Failed to load team performance data',
        //       loading: false 
        //     });
        //   }
        // },
        
        // exportData: async (format = 'csv') => {
        //   try {
        //     return await reportService.exportTeamPerformance(format, get().filters);
        //   } catch (error) {
        //     console.error('Export failed:', error);
        //     throw error;
        //   }
        // },
        
        reset: () => {
          // Clean up any active subscriptions
          if (get()._subscription) {
            get()._subscription();
          }
          return set(initialState);
        },
        
        // // Setup real-time updates
        // setupRealtimeUpdates: () => {
        //   // Clean up any existing subscription
        //   if (get()._subscription) {
        //     get()._subscription();
        //   }
          
        //   const unsubscribe = reportService.subscribeToTeamPerformance(
        //     (updatedData) => {
        //       set(state => ({
        //         data: {
        //           ...state.data,
        //           ...updatedData,
        //           metrics: { ...state.data.metrics, ...(updatedData.metrics || {}) },
        //           codeQualityMetrics: { 
        //             ...state.data.codeQualityMetrics, 
        //             ...(updatedData.codeQualityMetrics || {}) 
        //           }
        //         }
        //       }));
        //     },
        //     get().filters
        //   );
          
        //   // Store the unsubscribe function
        //   set({ _subscription: unsubscribe });
        //   return unsubscribe;
        // }
      }),
      {
        name: 'team-performance-storage',
        partialize: (state) => ({
          // Only persist filters, not the actual data
          filters: state.filters
        })
      }
    ),
    { name: 'TeamPerformanceStore' }
  )
);

export default useTeamPerformanceStore;
