// src/services/reportService.js
import { axiosInstance } from '../lib/axios';

const reportService = {
  // Upload report data
  uploadReportFile: async (file, reportName, reportType, onProgress) => {
    try {
      const formData = new FormData();
      formData.append('reportFile', file);
      formData.append('reportName', reportName);
      formData.append('reportType', reportType);
      
      const response = await axiosInstance.post('/reports/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: onProgress ? (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progressEvent);
        } : undefined
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading report file:', error);
      throw error;
    }
  },
  
  // Get list of uploaded reports
  getUploadedReports: async () => {
    try {
      const response = await axiosInstance.get('/reports/uploaded-reports');
      return response.data;
    } catch (error) {
      console.error('Error fetching uploaded reports:', error);
      throw error;
    }
  },
  
  // Get data from a specific report
  getReportData: async (reportId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/reports/uploaded-reports/${reportId}`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching report data:', error);
      throw error;
    }
  },
  
  // Export report data
  exportReport: async (reportId, format = 'csv') => {
    try {
      const response = await axiosInstance.get('/reports/export', {
        params: { reportId, format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  },

  // Delete a report
  deleteReport: async (reportId) => {
    try {
      const response = await axiosInstance.delete(`/reports/uploaded-reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }
};

export default reportService;