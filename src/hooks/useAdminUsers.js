import { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (userData) => {
    try {
      setIsLoading(true);

      // Try multiple endpoints for user creation
      let response;
      try {
        // First try auth/signup endpoint (admin only)
        response = await axiosInstance.post('/auth/signup', userData);
      } catch (signupErr) {
        console.log('Auth signup failed, trying auth/create:', signupErr.response?.data);
        // Fallback to auth create endpoint
        response = await axiosInstance.post('/auth/create', userData);
      }

      console.log('User created successfully:', response.data);

      // Refresh users list
      await fetchUsers();

      return response.data;
    } catch (err) {
      console.error('Error creating user:', err);
      throw new Error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      setIsLoading(true);

      const response = await axiosInstance.put(`/admin/users/${userId}`, userData);
      console.log('User updated successfully:', response.data);

      // Refresh users list
      await fetchUsers();

      return response.data;
    } catch (err) {
      console.error('Error updating user:', err);
      throw new Error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      setIsLoading(true);

      const response = await axiosInstance.delete(`/admin/users/${userId}`);
      console.log('User deleted successfully:', response.data);

      // Refresh users list
      await fetchUsers();

      return response.data;
    } catch (err) {
      console.error('Error deleting user:', err);
      throw new Error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId, newStatus) => {
    try {
      setIsLoading(true);

      const response = await axiosInstance.patch(`/admin/users/${userId}/status`, {
        status: newStatus,
        isActive: newStatus === 'active'
      });
      console.log('User status updated successfully:', response.data);

      // Refresh users list
      await fetchUsers();

      return response.data;
    } catch (err) {
      console.error('Error updating user status:', err);
      throw new Error(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    loading: isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    refreshUsers: fetchUsers
  };
}
