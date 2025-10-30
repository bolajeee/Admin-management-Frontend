import { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

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
        // Fallback to messages/users endpoint
        const res = await axiosInstance.get('/messages/users');
        users = res.data.data || res.data.users || res.data || [];
      }

      setUsers(users);
    } catch (err) {
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
        // Fallback to auth create endpoint
        response = await axiosInstance.post('/auth/create', userData);
      }

      // Refresh users list
      await fetchUsers();
      toast.success('User created successfully');

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create user';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      setIsLoading(true);

      const response = await axiosInstance.put(`/admin/users/${userId}`, userData);

      // Refresh users list
      await fetchUsers();
      toast.success('User updated successfully');

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update user';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      setIsLoading(true);

      const response = await axiosInstance.delete(`/admin/users/${userId}`);

      // Refresh users list
      await fetchUsers();
      toast.success('User deleted successfully');

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete user';
      toast.error(errorMessage);
      throw new Error(errorMessage);
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

      // Refresh users list
      await fetchUsers();
      toast.success('User status updated successfully');

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update user status';
      toast.error(errorMessage);
      throw new Error(errorMessage);
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
