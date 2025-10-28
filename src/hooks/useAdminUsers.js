import { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // Try multiple endpoints to get user data with roles
        let users = [];
        try {
          // First try admin users endpoint with populate
          const res = await axiosInstance.get('/admin/users?populate=role');
          users = res.data.data?.users || res.data.users || res.data.data || res.data || [];
        } catch (adminErr) {
          console.log('Admin users endpoint failed, trying messages/users:', adminErr.response?.data);
          // Fallback to messages/users endpoint
          const res = await axiosInstance.get('/messages/users');
          users = res.data.data || res.data.users || res.data || [];
        }

        console.log('Fetched users:', users.slice(0, 2)); // Log first 2 users for debugging
        setUsers(users);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return { users, isLoading, error };
}
