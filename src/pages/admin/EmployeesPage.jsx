import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle
} from "../../components/ui/card";
import { axiosInstance } from '../../lib/axios';
import {
  User, UserCog, Mail, ClipboardList, FileText, Trash2, Plus
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { useAuthStore } from '../../store/useAuthStore';

export default function EmployeesPage() {
  const { theme } = useThemeStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { deleteUser } = useAuthStore();

  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', role: 'employee' });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
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

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to remove ${userName}?`)) {
      try {
        await deleteUser(userId);
        const res = await axiosInstance.get('/messages/users');
        setUsers(res.data);
      } catch {
        setError('Failed to remove user');
      }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const res = await axiosInstance.post('/auth/create', newUser); // 🔁 adjust route as needed
      setUsers((prev) => [...prev, res.data.user]);
      setShowModal(false);
      setNewUser({ name: '', email: '', role: 'employee' });
      // Show default password info
      const defaultPassword = newUser.role === 'admin' ? 'admin' : 'employee';
      alert(`User created! Default password: '${defaultPassword}'. They should change it after first login.`);
    } catch {
      alert("Failed to add user.");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div data-theme={theme}>
      <h1 className="text-2xl font-bold mb-6 pt-[100px]">Manage Employees & Admins</h1>

      <div className="mb-6 flex justify-end">
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
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
                    <span className={`text-xs px-2 py-1 rounded ${user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  className="text-red-500 hover:text-red-700"
                  title="Remove"
                  onClick={() => handleDeleteUser(user._id, user.name)}
                >
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

      {/* === Modal === */}
      {showModal && (
        <div data-theme={theme} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-base-100 text-base-content p-6 rounded-lg w-full max-w-md shadow-lg relative">
            {/* Close (X) button */}
            <button
              type="button"
              className="absolute top-3 right-3 text-base-content hover:text-error focus:outline-none"
              aria-label="Close modal"
              onClick={() => setShowModal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold mb-4">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="input input-bordered w-full"
                  placeholder="Enter user name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="input input-bordered w-full"
                  placeholder="Enter user email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="role">Role</label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="text-xs text-gray-500 bg-gray-100 rounded p-2">
                A default password will be set for the new user: <b>'admin'</b> for admins, <b>'employee'</b> for employees. They should change it after first login.
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowModal(false)}
                  disabled={addLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={addLoading}>
                  {addLoading ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
