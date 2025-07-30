// src/store/useReportStore.js
import { create } from 'zustand';
import reportService from '../services/reportService';
import toast from 'react-hot-toast';

export const useReportStore = create((set, get) => ({
  // State
  uploadedReports: [],
  reportCategories: [], // New array to track available categories
  selectedReport: null,
  reportData: null,
  isLoading: false,
  error: null,
  
  // Fetch uploaded reports
  fetchUploadedReports: async () => {
    set({ isLoading: true, error: null });
    try {
      const reports = await reportService.getUploadedReports();
      
      // Extract categories from reports
      const categories = [...new Set(reports.map(report => report.type))];
      
      set({ 
        uploadedReports: reports, 
        reportCategories: categories,
        error: null 
      });
      
      return reports;
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Uploads a report file to the server.
 * 
 * @param {File} file - The file to be uploaded.
 * @param {string} reportName - The name of the report.
 * @param {string} reportType - The type of the report.
 * @param {function} onProgress - Callback function to track upload progress.
 * 
 * @returns {Promise<Object>} The server response after uploading the report.
 * 
 * @throws Will throw an error if the upload fails.
 */

/*******  04a5c2ef-eb9e-47c8-8204-7c9e68b33d38  *******/    } catch (error) {
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
      const data = await reportService.getReportData(reportId, params);
      set({ reportData: data, error: null });
      return data;
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
  }
}));