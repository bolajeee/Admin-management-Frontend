import { create } from 'zustand';

export const useReportStore = create((set) => ({
  activeReport: 'overview',
  dateRange: [null, null],
  filters: {},
  
  setActiveReport: (reportType) => set({ activeReport: reportType }),
  setDateRange: (range) => set({ dateRange: range }),
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  resetFilters: () => set({ filters: {} }),
}));