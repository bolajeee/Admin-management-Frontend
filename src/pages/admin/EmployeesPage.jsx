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

export default function EmployeesPage() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

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

  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const { deleteUser } = useAuthStore();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([
    { _id: 'employee', name: 'employee', description: 'Can view and manage their own tasks and memos.' },
    { _id: 'admin', name: 'admin', description: 'Can manage all users, tasks, and memos.' }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: '' });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const usersRes = await axiosInstance.get('/messages/users');
        const usersData = Array.isArray(usersRes.data) ? usersRes.data :
                         Array.isArray(usersRes.data.data) ? usersRes.data.data :
                         Array.isArray(usersRes.data.users) ? usersRes.data.users : [];

        const normalizedUsers = usersData.map(user => ({
          _id: user._id || user.id,
          name: user.name || '',
          email: user.email || '',
          role: user.role,
          profilePicture: user.profilePicture || user.profilePic || '/avatar.png',
          lastSeen: user.lastSeen || null,
          active: user.active !== undefined ? user.active : true,
        }));

        setUsers(normalizedUsers);

        const employeeRole = roles.find(role => role.name === 'employee');
        if (employeeRole) {
          setNewUser(prev => ({ ...prev, role: employeeRole._id }));
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDeleteUser = (userId, userName) => {
    setSelectedUser(users.find(u => u._id === userId));
    setShowDeleteModal(true);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const newPassword = Math.random().toString(36).slice(-8);
      const res = await axiosInstance.post('/auth/create', { ...newUser, password: newPassword });
      setUsers((prev) => [...prev, res.data.user]);
      setShowModal(false);
      const employeeRole = roles.find(role => role.name === 'employee');
      setNewUser({ name: '', email: '', role: employeeRole ? employeeRole._id : '' });
      setGeneratedPassword(newPassword);
      setShowPasswordModal(true);
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

  const roleMap = roles.reduce((acc, role) => {
    acc[role._id] = role.name;
    return acc;
  }, {});

  const filteredUsers = Array.isArray(users) ? users.filter(user =>
    ((user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
     (user?.email || '').toLowerCase().includes(search.toLowerCase()))
  ) : [];

  return (
    <div data-theme={theme}>
      <h1 className="text-2xl font-bold mb-6 pt-[100px]">Manage Employees & Admins</h1>

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
        <div className="overflow-x-auto w-full">
          <table className="table w-full min-w-full block">
            <thead>
              <tr>
                <th className="whitespace-nowrap">User</th>
                <th className="whitespace-nowrap">Email</th>
                <th className="whitespace-nowrap">Role</th>
                <th className="whitespace-nowrap">Last Seen</th>
                <th className="whitespace-nowrap">Status</th>
                <th className="whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => {
                if (!user) return null;
                const userId = user?._id || user?.id || `unknown-${idx}`;
                const userName = user?.name ?? '';
                const userEmail = user?.email ?? '';
                const userRole = roleMap[user.role] || user.role;
                const userProfilePicture = user?.profilePicture || user?.profilePic || '/avatar.png';
                const userLastSeen = user?.lastSeen ? new Date(user.lastSeen).toLocaleString() : 'N/A';
                const userActive = typeof user?.active === 'boolean' ? user.active : true;
                return (
                  <tr key={userId}>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img src={userProfilePicture} alt={userName || 'User'} onError={e => { e.target.src = '/avatar.png'; }} />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{userName || <span className="italic text-gray-400">No Name</span>}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">{userEmail || <span className="italic text-gray-400">No Email</span>}</td>
                    <td className="whitespace-nowrap">{userRole || <span className="italic text-gray-400">No Role</span>}</td>
                    <td className="whitespace-nowrap">{userLastSeen}</td>
                    <td className="whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="toggle toggle-success"
                        checked={userActive}
                        onChange={() => handleToggleActive(userId, userActive)}
                      />
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="dropdown dropdown-end">
                        <button tabIndex={0} className="btn btn-ghost btn-xs">...</button>
                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                          <li><a onClick={() => handleResetPassword(userId)}>Reset Password</a></li>
                          <li><a onClick={() => handleDeleteUser(userId, userName)}>Delete User</a></li>
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
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{roles.find(r => r._id === newUser.role)?.description}</p>
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

      {showPasswordModal && (
        <div data-theme={theme} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-base-100 text-base-content p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <h2 className="text-xl font-semibold mb-4">User Created Successfully</h2>
            <p>The user has been created with the following password:</p>
            <div className="flex items-center gap-2 my-4">
              <input type="text" readOnly value={generatedPassword} className="input input-bordered w-full" />
              <button
                className="btn btn-primary"
                onClick={() => {
                  navigator.clipboard.writeText(generatedPassword);
                  toast.success('Password copied to clipboard!');
                }}
              >
                Copy
              </button>
            </div>
            <div className="flex justify-end">
              <button
                className="btn"
                onClick={() => setShowPasswordModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}