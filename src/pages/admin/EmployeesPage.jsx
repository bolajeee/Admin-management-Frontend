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

/**
 * EmployeesPage - Admin page for managing employees and admins.
 *
 * Features:
 * - List, search, add, and remove users (employees/admins).
 * - View user details, tasks, messages, and memos.
 * - Responsive and accessible layout.
 */
export default function EmployeesPage() {
    // Theme and navigation
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const { deleteUser } = useAuthStore();

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', role: 'employee' });
  const [addLoading, setAddLoading] = useState(false);

  // Detail modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [userTasks, setUserTasks] = useState([]);
  const [userMessages, setUserMessages] = useState([]);
  const [userMemos, setUserMemos] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
// Fetch users on mount
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

  // Handler for deleting users
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
      alert(`User created! Default password: '${defaultPassword}'. They should change it after first login.`);
    } catch {
      alert("Failed to add user.");
    } finally {
      setAddLoading(false);
    }
  };

  // Filter users by search
  const filteredUsers = users.filter(user =>
    (user.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(search.toLowerCase())
  );

  // Fetch user details for modal
  const fetchUserDetails = async (user, tab) => {
    setSelectedUser(user);
    setActiveTab(tab);
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      if (tab === 'tasks') {
        const res = await axiosInstance.get(`/tasks/getUserTasks/${user._id}`);
        setUserTasks(res.data);
      } else if (tab === 'messages') {
        const res = await axiosInstance.get(`/messages/user/${user._id}`);
        setUserMessages(res.data);
      } else if (tab === 'memos') {
        const res = await axiosInstance.get(`/memos/user/${user._id}`);
        setUserMemos(res.data.data || res.data);
      }
    } catch {
      if (tab === 'tasks') setUserTasks([]);
      if (tab === 'messages') setUserMessages([]);
      if (tab === 'memos') setUserMemos([]);
    } finally {
      setDetailLoading(false);
    }
  };


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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full text-center text-base-content/60">No users found.</div>
          ) : filteredUsers.map((user) => (
            <Card key={user._id} className="transition-shadow hover:shadow-lg group border border-base-200 hover:border-primary/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  {user.role === 'admin' ? (
                    <UserCog className="h-7 w-7 text-blue-600" />
                  ) : (
                    <User className="h-7 w-7 text-gray-500" />
                  )}
                  <img
                    src={user.profilePicture || user.profilePic || '/avatar.png'}
                    alt={user.name || user.email}
                    className="h-10 w-10 rounded-full object-cover border border-base-300"
                  />
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {user.name || user.email}
                    </CardTitle>
                    <span className={`text-xs px-2 py-1 rounded ${user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {user.role}
                    </span>
                    {user.lastSeen && (
                      <div className="text-xs text-base-content/60 mt-0.5">Last seen: {new Date(user.lastSeen).toLocaleString()}</div>
                    )}
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
              {/* <CardContent>
                <div className="flex flex-col gap-2 mt-2">
                  <button
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-primary/10 transition-colors text-sm"
                    onClick={() => fetchUserDetails(user, 'tasks')}
                    title="View this user's tasks"
                  >
                    <ClipboardList className="h-4 w-4" /> View Tasks
                  </button>
                  <button
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-primary/10 transition-colors text-sm"
                    onClick={() => fetchUserDetails(user, 'messages')}
                    title="View this user's messages"
                  >
                    <Mail className="h-4 w-4" /> View Messages
                  </button>
                  <button
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-primary/10 transition-colors text-sm"
                    onClick={() => fetchUserDetails(user, 'memos')}
                    title="View this user's memos"
                  >
                    <FileText className="h-4 w-4" /> View Memos
                  </button>
                </div>
              </CardContent> */}
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

      {/* User Details Modal */}
      {detailModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-base-100 text-base-content p-6 rounded-lg w-full max-w-2xl shadow-lg relative">
            <button
              type="button"
              className="absolute top-3 right-3 text-base-content hover:text-error focus:outline-none"
              aria-label="Close modal"
              onClick={() => setDetailModalOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold mb-4">{selectedUser.name || selectedUser.email}</h2>
            <Tabs selectedIndex={['tasks', 'messages', 'memos'].indexOf(activeTab)} onChange={i => setActiveTab(['tasks', 'messages', 'memos'][i])}>
              <Tab.List className="flex gap-2 mb-4">
                <Tab className={({ selected }) => `px-4 py-2 rounded ${selected ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content'}`}>Tasks</Tab>
                <Tab className={({ selected }) => `px-4 py-2 rounded ${selected ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content'}`}>Messages</Tab>
                <Tab className={({ selected }) => `px-4 py-2 rounded ${selected ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content'}`}>Memos</Tab>
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel>
                  {detailLoading ? <div className="flex items-center justify-center h-32"><span className="loading loading-spinner loading-lg text-primary"></span></div> : (
                    <ul className="max-h-64 overflow-y-auto space-y-2">
                      {userTasks.length === 0 ? <li className="text-base-content/60 text-sm">No tasks found.</li> : userTasks.map((task, i) => (
                        <li key={task._id || i} className="border-b border-base-200 pb-2">
                          <div className="font-medium text-base-content">{task.title}</div>
                          <div className="text-xs text-base-content/60">Status: {task.status} | Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Tab.Panel>
                <Tab.Panel>
                  {detailLoading ? <div className="flex items-center justify-center h-32"><span className="loading loading-spinner loading-lg text-primary"></span></div> : (
                    <ul className="max-h-64 overflow-y-auto space-y-2">
                      {userMessages.length === 0 ? <li className="text-base-content/60 text-sm">No messages found.</li> : userMessages.map((msg, i) => (
                        <li key={msg._id || i} className="border-b border-base-200 pb-2">
                          <div className="text-base-content">{msg.content}</div>
                          <div className="text-xs text-base-content/60">Sent: {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'N/A'}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Tab.Panel>
                <Tab.Panel>
                  {detailLoading ? <div className="flex items-center justify-center h-32"><span className="loading loading-spinner loading-lg text-primary"></span></div> : (
                    <ul className="max-h-64 overflow-y-auto space-y-2">
                      {userMemos.length === 0 ? <li className="text-base-content/60 text-sm">No memos found.</li> : userMemos.map((memo, i) => (
                        <li key={memo._id || i} className="border-b border-base-200 pb-2">
                          <div className="font-medium text-base-content">{memo.title}</div>
                          <div className="text-xs text-base-content/60">Sent: {memo.createdAt ? new Date(memo.createdAt).toLocaleString() : 'N/A'}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Tab.Panel>
              </Tab.Panels>
            </Tabs>
          </div>
        </div>
      )}
    </div>
)

};
