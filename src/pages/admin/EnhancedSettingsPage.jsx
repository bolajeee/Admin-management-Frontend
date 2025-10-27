import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Mail,
  Phone,
  Globe,
  Lock,
  Key,
  Users,
  MessageSquare,
  CheckSquare,
  FileText,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';
import { axiosInstance } from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { THEMES, THEME_CATEGORIES } from '../../constants';
import Modal, { FormModal, ConfirmationModal } from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import toast from 'react-hot-toast';

const EnhancedSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteRoleModal, setShowDeleteRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Admin Management System',
      siteDescription: 'Comprehensive admin management platform',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      language: 'en'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      memoNotifications: true,
      taskNotifications: true,
      messageNotifications: true,
      digestFrequency: 'daily'
    },
    security: {
      passwordMinLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      twoFactorAuth: false
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromName: 'Admin Management',
      fromEmail: ''
    },
    sms: {
      provider: 'twilio',
      apiKey: '',
      apiSecret: '',
      fromNumber: ''
    }
  });

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { authUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    fetchSettings();
    fetchRoles();
    fetchPermissions();
    fetchAuditLogs();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/users/settings');
      if (response.data.settings) {
        setSettings(prev => ({ ...prev, ...response.data.settings }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get('/roles');
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      // Mock permissions - replace with actual API call
      setPermissions([
        { id: 'users.read', name: 'View Users', category: 'Users' },
        { id: 'users.write', name: 'Manage Users', category: 'Users' },
        { id: 'users.delete', name: 'Delete Users', category: 'Users' },
        { id: 'tasks.read', name: 'View Tasks', category: 'Tasks' },
        { id: 'tasks.write', name: 'Manage Tasks', category: 'Tasks' },
        { id: 'tasks.delete', name: 'Delete Tasks', category: 'Tasks' },
        { id: 'memos.read', name: 'View Memos', category: 'Memos' },
        { id: 'memos.write', name: 'Create Memos', category: 'Memos' },
        { id: 'memos.broadcast', name: 'Broadcast Memos', category: 'Memos' },
        { id: 'reports.read', name: 'View Reports', category: 'Reports' },
        { id: 'reports.write', name: 'Create Reports', category: 'Reports' },
        { id: 'settings.read', name: 'View Settings', category: 'Settings' },
        { id: 'settings.write', name: 'Manage Settings', category: 'Settings' }
      ]);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await axiosInstance.get('/audit');
      setAuditLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const handleSaveSettings = async (section) => {
    setSaving(true);
    try {
      await axiosInstance.put('/users/settings', {
        [section]: settings[section]
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/roles', roleForm);
      setShowRoleModal(false);
      resetRoleForm();
      fetchRoles();
      toast.success('Role created successfully');
    } catch (error) {
      toast.error('Failed to create role');
      console.error('Error creating role:', error);
    }
  };

  const handleEditRole = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/roles/${selectedRole._id}`, roleForm);
      setShowRoleModal(false);
      setSelectedRole(null);
      resetRoleForm();
      fetchRoles();
      toast.success('Role updated successfully');
    } catch (error) {
      toast.error('Failed to update role');
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteRole = async () => {
    try {
      await axiosInstance.delete(`/roles/${selectedRole._id}`);
      setShowDeleteRoleModal(false);
      setSelectedRole(null);
      fetchRoles();
      toast.success('Role deleted successfully');
    } catch (error) {
      toast.error('Failed to delete role');
      console.error('Error deleting role:', error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await axiosInstance.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error('Failed to change password');
      console.error('Error changing password:', error);
    }
  };

  const resetRoleForm = () => {
    setRoleForm({
      name: '',
      description: '',
      permissions: []
    });
  };

  const openCreateRoleModal = () => {
    resetRoleForm();
    setSelectedRole(null);
    setShowRoleModal(true);
  };

  const openEditRoleModal = (role) => {
    setSelectedRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions || []
    });
    setShowRoleModal(true);
  };

  const openDeleteRoleModal = (role) => {
    setSelectedRole(role);
    setShowDeleteRoleModal(true);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'sms', label: 'SMS', icon: Phone },
    { id: 'roles', label: 'Roles & Permissions', icon: Users },
    { id: 'audit', label: 'Audit Logs', icon: FileText }
  ];

  const roleColumns = [
    {
      key: 'name',
      label: 'Role Name',
      render: (name, role) => (
        <div>
          <div className="font-medium text-base-content">{name}</div>
          <div className="text-sm text-base-content/60">{role.description}</div>
        </div>
      )
    },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (permissions) => (
        <div className="flex flex-wrap gap-1">
          {(permissions || []).slice(0, 3).map((perm, index) => (
            <span key={index} className="badge badge-sm badge-outline">
              {perm}
            </span>
          ))}
          {permissions && permissions.length > 3 && (
            <span className="badge badge-sm badge-outline">
              +{permissions.length - 3} more
            </span>
          )}
        </div>
      )
    },
    {
      key: 'userCount',
      label: 'Users',
      render: (userCount) => (
        <span className="badge badge-info badge-sm">
          {userCount || 0} users
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (createdAt) => (
        <div className="text-sm">
          {new Date(createdAt).toLocaleDateString()}
        </div>
      )
    }
  ];

  const auditColumns = [
    {
      key: 'action',
      label: 'Action',
      render: (action, log) => (
        <div>
          <div className="font-medium text-base-content">{action}</div>
          <div className="text-sm text-base-content/60">{log.resource}</div>
        </div>
      )
    },
    {
      key: 'user',
      label: 'User',
      render: (user) => (
        <div className="text-sm">
          {user?.name || user?.email || 'System'}
        </div>
      )
    },
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (timestamp) => (
        <div className="text-sm">
          <div>{new Date(timestamp).toLocaleDateString()}</div>
          <div className="text-xs text-base-content/60">
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        </div>
      )
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      render: (ipAddress) => (
        <span className="font-mono text-sm">{ipAddress || 'N/A'}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span className={`badge badge-sm ${
          status === 'success' ? 'badge-success' : 
          status === 'failed' ? 'badge-error' : 
          'badge-warning'
        }`}>
          {status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content flex items-center gap-3">
            <Settings className="h-7 w-7 text-primary" />
            System Settings
          </h1>
          <p className="text-base-content/60 mt-1">
            Configure system preferences and security settings
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="btn btn-ghost btn-sm gap-2"
          >
            <Key className="h-4 w-4" />
            Change Password
          </button>
          
          <button
            onClick={() => handleSaveSettings(activeTab)}
            disabled={saving}
            className="btn btn-primary btn-sm gap-2"
          >
            {saving ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64">
          <div className="bg-base-100 rounded-lg shadow p-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-content'
                      : 'hover:bg-base-200 text-base-content'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-base-100 rounded-lg shadow p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold">General Settings</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text">Site Name</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={settings.general.siteName}
                          onChange={(e) => setSettings({
                            ...settings,
                            general: { ...settings.general, siteName: e.target.value }
                          })}
                        />
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text">Timezone</span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={settings.general.timezone}
                          onChange={(e) => setSettings({
                            ...settings,
                            general: { ...settings.general, timezone: e.target.value }
                          })}
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                        </select>
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text">Date Format</span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={settings.general.dateFormat}
                          onChange={(e) => setSettings({
                            ...settings,
                            general: { ...settings.general, dateFormat: e.target.value }
                          })}
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text">Language</span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={settings.general.language}
                          onChange={(e) => setSettings({
                            ...settings,
                            general: { ...settings.general, language: e.target.value }
                          })}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text">Site Description</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered w-full"
                        rows="3"
                        value={settings.general.siteDescription}
                        onChange={(e) => setSettings({
                          ...settings,
                          general: { ...settings.general, siteDescription: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold">Notification Settings</h2>
                    
                    <div className="space-y-4">
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">Email Notifications</span>
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={settings.notifications.emailNotifications}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, emailNotifications: e.target.checked }
                            })}
                          />
                        </label>
                      </div>

                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">SMS Notifications</span>
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={settings.notifications.smsNotifications}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, smsNotifications: e.target.checked }
                            })}
                          />
                        </label>
                      </div>

                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">Push Notifications</span>
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={settings.notifications.pushNotifications}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, pushNotifications: e.target.checked }
                            })}
                          />
                        </label>
                      </div>

                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">Memo Notifications</span>
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={settings.notifications.memoNotifications}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, memoNotifications: e.target.checked }
                            })}
                          />
                        </label>
                      </div>

                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">Task Notifications</span>
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={settings.notifications.taskNotifications}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, taskNotifications: e.target.checked }
                            })}
                          />
                        </label>
                      </div>

                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">Message Notifications</span>
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={settings.notifications.messageNotifications}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, messageNotifications: e.target.checked }
                            })}
                          />
                        </label>
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text">Digest Frequency</span>
                        </label>
                        <select
                          className="select select-bordered w-full max-w-xs"
                          value={settings.notifications.digestFrequency}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, digestFrequency: e.target.value }
                          })}
                        >
                          <option value="never">Never</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold">Security Settings</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text">Minimum Password Length</span>
                        </label>
                        <input
                          type="number"
                          className="input input-bordered w-full"
                          min="6"
                          max="32"
                          value={settings.security.passwordMinLength}
                          onChange={(e) => setSettings({
                            ...settings,
                            security: { ...settings.security, passwordMinLength: parseInt(e.target.value) }
                          })}
                        />
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text">Session Timeout (minutes)</span>
                        </label>
                        <input
                          type="number"
                          className="input input-bordered w-full"
                          min="5"
                          max="480"
                          value={settings.security.sessionTimeout}
                          onChange={(e) => setSettings({
                            ...settings,
                            security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                          })}
                        />
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text">Max Login Attempts</span>
                        </label>
                        <input
                          type="number"
                          className="input input-bordered w-full"
                          min="3"
                          max="10"
                          value={settings.security.maxLoginAttempts}
                          onChange={(e) => setSettings({
                            ...settings,
                            security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                          })}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">Require Special Characters</span>
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={settings.security.requireSpecialChars}
                            onChange={(e) => setSettings({
                              ...settings,
                              security: { ...settings.security, requireSpecialChars: e.target.checked }
                            })}
                          />
                        </label>
                      </div>

                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">Require Numbers</span>
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={settings.security.requireNumbers}
                            onChange={(e) => setSettings({
                              ...settings,
                              security: { ...settings.security, requireNumbers: e.target.checked }
                            })}
                          />
                        </label>
                      </div>

                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">Two-Factor Authentication</span>
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={settings.security.twoFactorAuth}
                            onChange={(e) => setSettings({
                              ...settings,
                              security: { ...settings.security, twoFactorAuth: e.target.checked }
                            })}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold">Appearance Settings</h2>
                    
                    <div>
                      <label className="label">
                        <span className="label-text">Current Theme: <span className="font-medium capitalize">{theme}</span></span>
                      </label>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
                        {THEMES.slice(0, 12).map((themeName) => (
                          <button
                            key={themeName}
                            onClick={() => setTheme(themeName)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              theme === themeName
                                ? 'border-primary bg-primary/10'
                                : 'border-base-300 hover:border-primary/50'
                            }`}
                            data-theme={themeName}
                          >
                            <div className="space-y-2">
                              <div className="flex gap-1">
                                <div className="w-4 h-4 rounded bg-primary"></div>
                                <div className="w-4 h-4 rounded bg-secondary"></div>
                                <div className="w-4 h-4 rounded bg-accent"></div>
                              </div>
                              <div className="w-full h-2 rounded bg-base-200"></div>
                              <p className="text-xs font-medium capitalize">{themeName}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      <p className="text-sm text-base-content/60 mt-4">
                        More themes available in the theme selector (click the palette icon in the navbar)
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'roles' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Roles & Permissions</h2>
                      <button
                        onClick={openCreateRoleModal}
                        className="btn btn-primary btn-sm gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create Role
                      </button>
                    </div>
                    
                    <DataTable
                      data={roles}
                      columns={roleColumns}
                      loading={loading}
                      title="System Roles"
                      searchable={true}
                      filterable={false}
                      sortable={true}
                      pagination={true}
                      pageSize={10}
                      onEdit={openEditRoleModal}
                      onDelete={openDeleteRoleModal}
                      onRefresh={fetchRoles}
                    />
                  </div>
                )}

                {activeTab === 'audit' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold">Audit Logs</h2>
                    
                    <DataTable
                      data={auditLogs}
                      columns={auditColumns}
                      loading={loading}
                      title="System Audit Trail"
                      searchable={true}
                      filterable={true}
                      sortable={true}
                      pagination={true}
                      pageSize={15}
                      onRefresh={fetchAuditLogs}
                    />
                  </div>
                )}

                {/* Email and SMS tabs would have similar form structures */}
                {(activeTab === 'email' || activeTab === 'sms') && (
                  <div className="text-center py-12">
                    <Settings className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-base-content mb-2">
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Configuration
                    </h3>
                    <p className="text-base-content/60">
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} settings configuration coming soon.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <FormModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        onSubmit={handleChangePassword}
        submitText="Change Password"
      >
        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Current Password</span>
            </label>
            <input
              type="password"
              className="input input-bordered w-full"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">New Password</span>
            </label>
            <input
              type="password"
              className="input input-bordered w-full"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Confirm New Password</span>
            </label>
            <input
              type="password"
              className="input input-bordered w-full"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
            />
          </div>
        </div>
      </FormModal>

      {/* Role Modal */}
      <FormModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title={selectedRole ? 'Edit Role' : 'Create Role'}
        onSubmit={selectedRole ? handleEditRole : handleCreateRole}
        submitText={selectedRole ? 'Update Role' : 'Create Role'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Role Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={roleForm.name}
              onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              value={roleForm.description}
              onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Permissions</span>
            </label>
            <div className="max-h-60 overflow-y-auto border border-base-300 rounded p-3">
              {Object.entries(
                permissions.reduce((acc, perm) => {
                  if (!acc[perm.category]) acc[perm.category] = [];
                  acc[perm.category].push(perm);
                  return acc;
                }, {})
              ).map(([category, perms]) => (
                <div key={category} className="mb-4">
                  <h4 className="font-medium text-base-content mb-2">{category}</h4>
                  <div className="space-y-2">
                    {perms.map((perm) => (
                      <label key={perm.id} className="label cursor-pointer">
                        <span className="label-text text-sm">{perm.name}</span>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={roleForm.permissions.includes(perm.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRoleForm({
                                ...roleForm,
                                permissions: [...roleForm.permissions, perm.id]
                              });
                            } else {
                              setRoleForm({
                                ...roleForm,
                                permissions: roleForm.permissions.filter(p => p !== perm.id)
                              });
                            }
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FormModal>

      {/* Delete Role Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteRoleModal}
        onClose={() => setShowDeleteRoleModal(false)}
        onConfirm={handleDeleteRole}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${selectedRole?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="error"
      />
    </div>
  );
};

export default EnhancedSettingsPage;