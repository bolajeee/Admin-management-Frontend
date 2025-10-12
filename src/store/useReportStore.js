// src/store/useReportStore.js
import { create } from 'zustand';
import reportService from '../services/reportService';
import toast from 'react-hot-toast';

export const useReportStore = create((set, get) => ({
  // State
  uploadedReports: [],
  selectedReport: null,
  reportData: null,
  isLoading: false,
  error: null,
  
  // Fetch uploaded reports
  fetchUploadedReports: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await reportService.getUploadedReports();
      const reports = response.data;
      
      set({ 
        uploadedReports: Array.isArray(reports) ? reports : [], 
        error: null 
      });
      
      return reports;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch reports';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Upload report
  uploadReport: async (file, reportName, reportType, onProgress) => {
    set({ isLoading: true, error: null });
    try {
      const result = await reportService.uploadReportFile(file, reportName, reportType, onProgress);
      toast.success('Report uploaded successfully');
      
      // Refresh reports list
      get().fetchUploadedReports();
      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload report';
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Select a report to view
  selectReport: (reportId) => {
    const { uploadedReports } = get();
    const report = uploadedReports.find(r => r.id === reportId || r._id === reportId);
    set({ selectedReport: report });
    if (report) {
      get().fetchReportData(reportId);
    }
  },
  
  // Fetch data for a specific report
  fetchReportData: async (reportId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reportService.getReportData(reportId, params);
      set({ reportData: response.data, error: null });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch report data';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Clear report data
  clearReportData: () => {
    set({ reportData: null, selectedReport: null });
  },

  // Delete a report
  deleteReport: async (reportId) => {
    set({ isLoading: true, error: null });
    try {
      await reportService.deleteReport(reportId);
      toast.success('Report deleted successfully');
      set((state) => ({
        uploadedReports: state.uploadedReports.filter((report) => report.id !== reportId && report._id !== reportId),
      }));
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete report';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },
}));