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
};

export default reportService;