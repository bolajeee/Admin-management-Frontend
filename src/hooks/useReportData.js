import { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';

export function useReportData(reportType, dateRange) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        let endpoint = `/reports/${reportType}`;

        // Add date range if provided
        if (dateRange && dateRange[0] && dateRange[1]) {
          const startDate = dateRange[0].toISOString();
          const endDate = dateRange[1].toISOString();
          endpoint += `?startDate=${startDate}&endDate=${endDate}`;
        }

        const response = await axiosInstance.get(endpoint);
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching ${reportType} report:`, err);
        setError(`Failed to load ${reportType} report data`);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [reportType, dateRange]);
  return { data, loading, error };
}
