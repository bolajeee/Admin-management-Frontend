import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { axiosInstance } from '../../lib/axios';
import { User, UserCog, Mail, ClipboardList, FileText, Trash2, Plus } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { useAuthStore } from '../../store/useAuthStore';

export default function EmployeesPage() {
  const { theme } = useThemeStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { deleteUser } = useAuthStore();

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get('/messages/users');
        setUsers(res.data);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      try {
        await deleteUser(userId);
        // Refetch users after deletion to ensure UI is in sync with backend
        const res = await axiosInstance.get('/messages/users');
        setUsers(res.data);
      } catch (err) {
        setError('Failed to remove user');
      }
    }
  }

  return (
    <div data-theme={theme}>
      <h1 className="text-2xl font-bold mb-6 pt-[100px]">Manage Employees & Admins</h1>
      <div className="mb-6 flex justify-end">
        <button className="btn btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Employee/Admin
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user._id} className="transition-shadow hover:shadow-lg group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  {user.role === 'admin' ? (
                    <UserCog className="h-7 w-7 text-blue-600" />
                  ) : (
                    <User className="h-7 w-7 text-gray-500" />
                  )}
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {user.name || user.email}
                    </CardTitle>
                    <span className={`text-xs px-2 py-1 rounded ${user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{user.role}</span>
                  </div>
                </div>
                <button className="text-red-500 hover:text-red-700" title="Remove" onClick={() => handleDeleteUser(user._id)}>
                  <Trash2 className="h-5 w-5" />
                </button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 mt-2">
                  <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-primary/10 transition-colors text-sm">
                    <ClipboardList className="h-4 w-4" /> View Tasks
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-primary/10 transition-colors text-sm">
                    <Mail className="h-4 w-4" /> View Messages
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-primary/10 transition-colors text-sm">
                    <FileText className="h-4 w-4" /> View Memos
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
