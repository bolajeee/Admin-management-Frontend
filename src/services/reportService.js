import { axiosInstance } from '../lib/axios';

const reportService = {
  // Team Performance Endpoints
  getTeamPerformance: async (filters = {}) => {
    try {
      const response = await axiosInstance.get(`/reports/team-performance`, { 
        params: filters,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching team performance data:', error);
      throw error;
    }
  },

  // Export functionality
  exportTeamPerformance: async (format = 'csv', filters = {}) => {
    try {
      const response = await axiosInstance({
        url: `/reports/team-performance/export`,
        method: 'GET',
        params: { ...filters, format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting team performance data:', error);
      throw error;
    }
  },

  // Real-time updates
  subscribeToTeamPerformance: (onUpdate, filters = {}) => {
    const eventSource = new EventSource(
      `/reports/team-performance/stream?${new URLSearchParams(filters).toString()}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    eventSource.onerror = (error) => {
      console.error('Error with team performance stream:', error);
      eventSource.close();
    };

    return () => eventSource.close();
  },

  // src/services/reportService.js
// Add these methods to your existing service
  
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
}
};

export default reportService;