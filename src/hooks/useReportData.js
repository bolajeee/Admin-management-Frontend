import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const useReportData = (dateRange, filters = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In a real app, you would fetch data from your API
        // const response = await yourApi.get('/reports', { params: { dateRange, ...filters } });
        // setData(response.data);
        
        // Mock data for now
        const mockData = {
          projectPerformance: {
            totalProjects: 12,
            completed: 8,
            inProgress: 3,
            delayed: 1,
            timelineAdherence: 75, // percentage
            budgetVariance: -4.2, // percentage
            projectsByStatus: [
              { status: 'Completed', count: 8 },
              { status: 'In Progress', count: 3 },
              { status: 'Delayed', count: 1 },
            ],
          },
          // Add more mock data as needed
        };
        
        setData(mockData);
      } catch (err) {
        setError(err);
        console.error('Error fetching report data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange, filters]);

  return { data, isLoading, error };
};

export default useReportData;
