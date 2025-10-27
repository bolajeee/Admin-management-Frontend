import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Modal, { FormModal, ConfirmationModal } from '../../components/ui/Modal';
import UserAvatar from '../../components/ui/UserAvatar';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import toast from 'react-hot-toast';

const EnhancedEmployeesPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    department: '',
    phone: '',
    status: 'active'
  });

  // Using existing hook
  const { users, loading, createUser, updateUser, deleteUser, toggleUserStatus } = useAdminUsers();

  // Table columns configuration
  const columns = [
    {
      key: 'avatar',
      label: 'Avatar',
      render: (_, user) => (
        <UserAvatar user={user} size="w-10 h-10" showTooltip />
      ),
      className: 'w-16'
    },
    {
      key: 'name',
      label: 'Name',
      render: (name, user) => (
        <div>
          <div className="font-medium text-base-content">{name || 'N/A'}</div>
          <div className="text-sm text-base-content/60">{user.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (role) => (
        <span className={`badge ${role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
          {role}
        </span>
      )
    },
    {
      key: 'department',
      label: 'Department',
      render: (department) => department || 'Not assigned'
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, user) => (
        <div className="flex items-center gap-2">
          {user.isActive ? (
            <>
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-success">Active</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-error" />
              <span className="text-error">Inactive</span>
            </>
          )}
        </div>
      )
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (_, user) => (
        <div className="flex items-center gap-1 text-sm text-base-content/60">
          <Clock className="h-3 w-3" />
          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (createdAt) => new Date(createdAt).toLocaleDateString()
    }
  ];

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(formData);
      setShowAddModal(false);
      setFormData({ name: '', email: '', role: 'employee', department: '', phone: '', status: 'active' });
      toast.success('User created successfully');
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      await updateUser(selectedUser._id, formData);
      setShowEditModal(false);
      setSelectedUser(null);
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(selectedUser._id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await toggleUserStatus(user._id);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'employee',
      department: user.department || '',
      phone: user.phone || '',
      status: user.isActive ? 'active' : 'inactive'
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleExport = () => {
    // Implement export functionality
    toast.success('Export functionality coming soon');
  };

  const handleImport = () => {
    // Implement import functionality
    toast.success('Import functionality coming soon');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content flex items-center gap-3">
            <Users className="h-7 w-7 text-primary" />
            Employee Management
          </h1>
          <p className="text-base-content/60 mt-1">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleImport}
            className="btn btn-ghost btn-sm gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </button>
          
          <button
            onClick={handleExport}
            className="btn btn-ghost btn-sm gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Employees</p>
              <p className="text-2xl font-bold">{users?.length || 0}</p>
            </div>
            <Users className="h-8 w-8 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Users</p>
              <p className="text-2xl font-bold">
                {users?.filter(u => u.isActive).length || 0}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Admins</p>
              <p className="text-2xl font-bold">
                {users?.filter(u => u.role === 'admin').length || 0}
              </p>
            </div>
            <Shield className="h-8 w-8 text-purple-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">New This Month</p>
              <p className="text-2xl font-bold">
                {users?.filter(u => {
                  const created = new Date(u.createdAt);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length || 0}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-orange-200" />
          </div>
        </motion.div>
      </div>

      {/* Data Table */}
      <DataTable
        data={users || []}
        columns={columns}
        loading={loading}
        title="Employee Directory"
        searchable={true}
        filterable={true}
        sortable={true}
        pagination={true}
        pageSize={10}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        onView={(user) => toast.info(`Viewing ${user.name || user.email}`)}
        onRefresh={() => window.location.reload()}
        onExport={handleExport}
      />

      {/* Add User Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Employee"
        onSubmit={handleAddUser}
        submitText="Create Employee"
        loading={loading}
      >
        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Full Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Email Address</span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Role</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Department</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Phone Number</span>
            </label>
            <input
              type="tel"
              className="input input-bordered w-full"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>
      </FormModal>

      {/* Edit User Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Employee"
        onSubmit={handleEditUser}
        submitText="Update Employee"
        loading={loading}
      >
        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Full Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Email Address</span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Role</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Department</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Phone Number</span>
            </label>
            <input
              type="tel"
              className="input input-bordered w-full"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUser}
        title="Delete Employee"
        message={`Are you sure you want to delete ${selectedUser?.name || selectedUser?.email}? This action cannot be undone.`}
        confirmText="Delete"
        type="error"
        loading={loading}
      />
    </div>
  );
};

export default EnhancedEmployeesPage;