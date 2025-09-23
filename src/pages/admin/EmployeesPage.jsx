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
import { useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/modals/ConfirmationModal';

/**
 * EmployeesPage - Admin page for managing employees and admins.
 *
 * Features:
 * - List, search, add, and remove users (employees/admins).
 * - View user details, tasks, messages, and memos.
 * - Responsive and accessible layout.
 */
export default function EmployeesPage() {
  // Modal states for confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Confirm handlers
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await axiosInstance.delete(`/admin/users/${selectedUser._id}`);
      setUsers(users.filter(u => u._id !== selectedUser._id));
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch {
      setError('Failed to remove user');
      toast.error('Failed to remove user');
    }
  };

  const confirmResetPassword = async () => {
    if (!selectedUser) return;
    try {
      await axiosInstance.post(`/admin/users/${selectedUser._id}/reset-password`);
      toast.success('Password reset successfully.');
      setShowResetModal(false);
      setSelectedUser(null);
    } catch {
      toast.error('Failed to reset password.');
    }
  };
    // Theme and navigation
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const { deleteUser } = useAuthStore();

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(''); // Always initialize as empty string

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', role: 'employee' });
  const [addLoading, setAddLoading] = useState(false);

  // Fetch users on mount
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/messages/users');
        const usersData = Array.isArray(res.data) ? res.data :
                         Array.isArray(res.data.data) ? res.data.data :
                         Array.isArray(res.data.users) ? res.data.users : [];

        const normalizedUsers = usersData.map(user => ({
          _id: user._id || user.id,
          name: user.name || '',
          email: user.email || '',
          role: user.role || 'employee',
          profilePicture: user.profilePicture || user.profilePic || '/avatar.png',
          lastSeen: user.lastSeen || null,
          active: user.active !== undefined ? user.active : true, // Assume active if not specified
        }));

        setUsers(normalizedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Handler for deleting users
  const handleDeleteUser = (userId, userName) => {
    setSelectedUser(users.find(u => u._id === userId));
    setShowDeleteModal(true);
  };

  // Handler for adding new users
  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const res = await axiosInstance.post('/auth/create', newUser);
      setUsers((prev) => [...prev, res.data.user]);
      setShowModal(false);
      setNewUser({ name: '', email: '', role: 'employee' });
      const defaultPassword = newUser.role === 'admin' ? 'admin' : 'employee';
      toast.success(`User created! Default password: '${defaultPassword}'. They should change it after first login.`);
    } catch {
      toast.error("Failed to add user.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    setUsers(users.map(u => u._id === userId ? { ...u, active: !currentStatus } : u));

    try {
      await axiosInstance.patch(`/admin/users/${userId}/toggle-active`);
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully.`);
    } catch (error) {
      setUsers(users.map(u => u._id === userId ? { ...u, active: currentStatus } : u));
      toast.error('Failed to update user status.');
    }
  };

  const handleResetPassword = async (userId) => {
    setSelectedUser(users.find(u => u._id === userId));
    setShowResetModal(true);
  };

  // Filter users by search with safety checks
  const filteredUsers = Array.isArray(users) ? users.filter(user =>
    ((user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
     (user?.email || '').toLowerCase().includes(search.toLowerCase()))
  ) : [];

    return (
    <div data-theme={theme}>
      <h1 className="text-2xl font-bold mb-6 pt-[100px]">Manage Employees & Admins</h1>

      {/* Search Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <input
          type="text"
          className="input input-bordered w-full md:w-1/3"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <Plus className="h-4 w-4" /> Add Employee/Admin
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Seen</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                if (!user) return null;
                return (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img src={user.profilePicture || '/avatar.png'} alt={user.name || 'User'} />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{user.name || 'Unknown'}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email || ''}</td>
                    <td>
                      {user.role && typeof user.role === 'object' && user.role.name
                        ? user.role.name
                        : (typeof user.role === 'string' ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Employee')}
                    </td>
                    <td>{user.lastSeen ? new Date(user.lastSeen).toLocaleString() : 'N/A'}</td>
                    <td>
                      <input
                        type="checkbox"
                        className="toggle toggle-success"
                        checked={!!user.active}
                        onChange={() => handleToggleActive(user._id, user.active)}
                      />
                    </td>
                    <td>
                      <div className="dropdown dropdown-end">
                        <button tabIndex={0} className="btn btn-ghost btn-xs">...</button>
                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                          <li><a onClick={() => handleResetPassword(user._id)}>Reset Password</a></li>
                          <li><a onClick={() => handleDeleteUser(user._id, user.name)}>Delete User</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.name}?`}
      />

      <ConfirmationModal
        show={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={confirmResetPassword}
        title="Reset Password"
        message={`Are you sure you want to reset the password for ${selectedUser?.name}?`}
      />

      {/* === Modal === */}
      {showModal && (
        <div data-theme={theme} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-base-100 text-base-content p-6 rounded-lg w-full max-w-md shadow-lg relative">
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
)}