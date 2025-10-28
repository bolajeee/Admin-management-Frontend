import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Send,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  AlertCircle,
  Volume2,
  VolumeX,
  Star,
  Archive,
  Download,
  Upload,
  Calendar,
  User,
  Target
} from 'lucide-react';
import { axiosInstance } from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import DataTable from '../../components/ui/DataTable';
import Modal, { FormModal, ConfirmationModal } from '../../components/ui/Modal';
import UserAvatar from '../../components/ui/UserAvatar';
import toast from 'react-hot-toast';

const EnhancedMemosPage = () => {
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [memoStats, setMemoStats] = useState({});
  const [analyticsData, setAnalyticsData] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, high, medium, low
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    severity: 'medium',
    recipients: [],
    broadcast: true,
    expiresAt: '',
    attachments: []
  });

  const { authUser } = useAuthStore();
  const { users, getUsers } = useChatStore();

  useEffect(() => {
    fetchMemos();
    fetchMemoStats();
    fetchAnalytics();
    getUsers();
  }, []);

  const fetchMemos = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/memos/all');
      const memosData = response.data.memos || response.data.data || response.data || [];
      console.log('Memos API response:', response.data);
      console.log('Extracted memos:', memosData);
      setMemos(memosData);
    } catch (error) {
      console.error('Error fetching memos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemoStats = async () => {
    try {
      const response = await axiosInstance.get('/memos/count');
      setMemoStats(response.data);
    } catch (error) {
      console.error('Error fetching memo stats:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axiosInstance.get('/memos/analytics/read');
      setAnalyticsData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleCreateMemo = async (e) => {
    e.preventDefault();
    try {
      if (formData.broadcast) {
        await axiosInstance.post('/memos/broadcast', {
          title: formData.title,
          content: formData.content,
          severity: formData.severity,
          expiresAt: formData.expiresAt || undefined
        });
      } else {
        await axiosInstance.post('/memos', {
          title: formData.title,
          content: formData.content,
          severity: formData.severity,
          recipients: formData.recipients,
          expiresAt: formData.expiresAt || undefined
        });
      }
      
      setShowCreateModal(false);
      resetForm();
      fetchMemos();
      fetchMemoStats();
      toast.success('Memo created successfully');
    } catch (error) {
      toast.error('Failed to create memo');
      console.error('Error creating memo:', error);
    }
  };

  const handleEditMemo = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/memos/${selectedMemo._id}`, {
        title: formData.title,
        content: formData.content,
        severity: formData.severity,
        expiresAt: formData.expiresAt || undefined
      });
      
      setShowEditModal(false);
      setSelectedMemo(null);
      resetForm();
      fetchMemos();
      toast.success('Memo updated successfully');
    } catch (error) {
      toast.error('Failed to update memo');
      console.error('Error updating memo:', error);
    }
  };

  const handleDeleteMemo = async () => {
    try {
      await axiosInstance.delete(`/memos/${selectedMemo._id}`);
      setShowDeleteModal(false);
      setSelectedMemo(null);
      fetchMemos();
      fetchMemoStats();
      toast.success('Memo deleted successfully');
    } catch (error) {
      toast.error('Failed to delete memo');
      console.error('Error deleting memo:', error);
    }
  };

  const handleMarkAsRead = async (memoId) => {
    try {
      await axiosInstance.patch(`/memos/${memoId}/read`);
      fetchMemos();
      toast.success('Memo marked as read');
    } catch (error) {
      toast.error('Failed to mark memo as read');
    }
  };

  const handleAcknowledge = async (memoId) => {
    try {
      await axiosInstance.patch(`/memos/${memoId}/acknowledge`);
      fetchMemos();
      toast.success('Memo acknowledged');
    } catch (error) {
      toast.error('Failed to acknowledge memo');
    }
  };

  const handleSnooze = async (memoId) => {
    try {
      await axiosInstance.patch(`/memos/${memoId}/snooze`);
      fetchMemos();
      toast.success('Memo snoozed');
    } catch (error) {
      toast.error('Failed to snooze memo');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      severity: 'medium',
      recipients: [],
      broadcast: true,
      expiresAt: '',
      attachments: []
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (memo) => {
    setSelectedMemo(memo);
    setFormData({
      title: memo.title,
      content: memo.content,
      severity: memo.severity,
      recipients: memo.recipients || [],
      broadcast: memo.broadcast || false,
      expiresAt: memo.expiresAt ? new Date(memo.expiresAt).toISOString().split('T')[0] : '',
      attachments: memo.attachments || []
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (memo) => {
    setSelectedMemo(memo);
    setShowDeleteModal(true);
  };

  const openViewModal = (memo) => {
    setSelectedMemo(memo);
    setShowViewModal(true);
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-error" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'medium':
        return <Info className="h-4 w-4 text-info" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <Info className="h-4 w-4 text-info" />;
    }
  };

  const getSeverityBadge = (severity) => {
    const classes = {
      critical: 'badge-error',
      high: 'badge-warning',
      medium: 'badge-info',
      low: 'badge-success'
    };
    return `badge ${classes[severity] || 'badge-info'}`;
  };

  const filteredMemos = memos.filter(memo => {
    if (!memo || !memo.title) {
      console.warn('Invalid memo object:', memo);
      return false;
    }
    
    const matchesSearch = memo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memo.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'unread') return matchesSearch && !memo.isRead;
    return matchesSearch && memo.severity === filter;
  });

  // Debug filtered memos
  console.log('Filtered memos:', filteredMemos.length, filteredMemos);

  const columns = [
    {
      key: 'severity',
      label: 'Priority',
      render: (severity) => (
        <div className="flex items-center gap-2">
          {getSeverityIcon(severity)}
          <span className={`badge badge-sm ${getSeverityBadge(severity)}`}>
            {severity.toUpperCase()}
          </span>
        </div>
      ),
      className: 'w-24'
    },
    {
      key: 'title',
      label: 'Title',
      render: (title, memo) => (
        <div>
          <div className="font-medium text-base-content">{title}</div>
          <div className="text-sm text-base-content/60 truncate max-w-xs">
            {memo.content}
          </div>
        </div>
      )
    },
    {
      key: 'author',
      label: 'Author',
      render: (_, memo) => (
        <div className="flex items-center gap-2">
          <UserAvatar user={memo.author} size="w-6 h-6" />
          <span className="text-sm">{memo.author?.name || memo.author?.email}</span>
        </div>
      )
    },
    {
      key: 'recipients',
      label: 'Recipients',
      render: (recipients, memo) => (
        <div className="flex items-center gap-1">
          {memo.broadcast ? (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm">All Users</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4 text-info" />
              <span className="text-sm">{recipients?.length || 0} users</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'readCount',
      label: 'Read Status',
      render: (_, memo) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{memo.readCount || 0} read</span>
          </div>
          <div className="text-xs text-base-content/60">
            {memo.acknowledgedCount || 0} acknowledged
          </div>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (createdAt) => (
        <div className="text-sm">
          <div>{new Date(createdAt).toLocaleDateString()}</div>
          <div className="text-xs text-base-content/60">
            {new Date(createdAt).toLocaleTimeString()}
          </div>
        </div>
      )
    },
    {
      key: 'expiresAt',
      label: 'Expires',
      render: (expiresAt) => (
        expiresAt ? (
          <div className="text-sm">
            <div>{new Date(expiresAt).toLocaleDateString()}</div>
            <div className="text-xs text-base-content/60">
              {new Date(expiresAt) < new Date() ? 'Expired' : 'Active'}
            </div>
          </div>
        ) : (
          <span className="text-sm text-base-content/60">Never</span>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content flex items-center gap-3">
            <Bell className="h-7 w-7 text-primary" />
            Memo Management
          </h1>
          <p className="text-base-content/60 mt-1">
            Create and manage company announcements and notifications
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
          
          <button
            onClick={openCreateModal}
            className="btn btn-primary btn-sm gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Memo
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
              <p className="text-blue-100 text-sm">Total Memos</p>
              <p className="text-2xl font-bold">{memos.length}</p>
            </div>
            <Bell className="h-8 w-8 text-blue-200" />
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
              <p className="text-green-100 text-sm">Read Memos</p>
              <p className="text-2xl font-bold">
                {memos.filter(m => m.readCount > 0).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">High Priority</p>
              <p className="text-2xl font-bold">
                {memos.filter(m => m.severity === 'high' || m.severity === 'critical').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">This Month</p>
              <p className="text-2xl font-bold">
                {memos.filter(m => {
                  const created = new Date(m.createdAt);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-200" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search memos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          {['all', 'unread', 'critical', 'high', 'medium', 'low'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`btn btn-sm ${
                filter === filterOption ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredMemos}
        columns={columns}
        loading={loading}
        title="Memos"
        searchable={false} // We have custom search
        filterable={false} // We have custom filters
        sortable={true}
        pagination={true}
        pageSize={10}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        onView={openViewModal}
        onRefresh={fetchMemos}
      />

      {/* Create Memo Modal */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Memo"
        onSubmit={handleCreateMemo}
        submitText="Create Memo"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Title *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Content *</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-32"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Priority</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Expires On</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label cursor-pointer">
              <span className="label-text">Broadcast to all users</span>
              <input
                type="checkbox"
                className="checkbox"
                checked={formData.broadcast}
                onChange={(e) => setFormData({ ...formData, broadcast: e.target.checked })}
              />
            </label>
          </div>

          {!formData.broadcast && (
            <div>
              <label className="label">
                <span className="label-text">Select Recipients</span>
              </label>
              <div className="max-h-40 overflow-y-auto border border-base-300 rounded p-2">
                {users.map((user) => (
                  <label key={user._id} className="label cursor-pointer">
                    <div className="flex items-center gap-2">
                      <UserAvatar user={user} size="w-6 h-6" />
                      <span className="text-sm">{user.name || user.email}</span>
                    </div>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={formData.recipients.includes(user._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            recipients: [...formData.recipients, user._id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            recipients: formData.recipients.filter(id => id !== user._id)
                          });
                        }
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </FormModal>

      {/* Edit Memo Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Memo"
        onSubmit={handleEditMemo}
        submitText="Update Memo"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Title *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Content *</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-32"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Priority</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Expires On</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
            </div>
          </div>
        </div>
      </FormModal>

      {/* View Memo Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Memo Details"
        size="lg"
      >
        {selectedMemo && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSeverityIcon(selectedMemo.severity)}
                <span className={`badge ${getSeverityBadge(selectedMemo.severity)}`}>
                  {selectedMemo.severity.toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-base-content/60">
                {new Date(selectedMemo.createdAt).toLocaleString()}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">{selectedMemo.title}</h3>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{selectedMemo.content}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-base-300">
              <div>
                <label className="text-sm font-medium text-base-content/70">Author</label>
                <div className="flex items-center gap-2 mt-1">
                  <UserAvatar user={selectedMemo.author} size="w-6 h-6" />
                  <span>{selectedMemo.author?.name || selectedMemo.author?.email}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-base-content/70">Recipients</label>
                <div className="flex items-center gap-1 mt-1">
                  {selectedMemo.broadcast ? (
                    <>
                      <Users className="h-4 w-4 text-primary" />
                      <span>All Users</span>
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 text-info" />
                      <span>{selectedMemo.recipients?.length || 0} users</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-base-content/70">Read Count</label>
                <p className="mt-1">{selectedMemo.readCount || 0} users</p>
              </div>

              <div>
                <label className="text-sm font-medium text-base-content/70">Acknowledged</label>
                <p className="mt-1">{selectedMemo.acknowledgedCount || 0} users</p>
              </div>
            </div>

            {selectedMemo.expiresAt && (
              <div className="pt-4 border-t border-base-300">
                <label className="text-sm font-medium text-base-content/70">Expires</label>
                <p className="mt-1">
                  {new Date(selectedMemo.expiresAt).toLocaleString()}
                  {new Date(selectedMemo.expiresAt) < new Date() && (
                    <span className="ml-2 badge badge-error badge-sm">Expired</span>
                  )}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => handleMarkAsRead(selectedMemo._id)}
                className="btn btn-sm btn-ghost gap-2"
              >
                <Eye className="h-4 w-4" />
                Mark as Read
              </button>
              <button
                onClick={() => handleAcknowledge(selectedMemo._id)}
                className="btn btn-sm btn-ghost gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Acknowledge
              </button>
              <button
                onClick={() => handleSnooze(selectedMemo._id)}
                className="btn btn-sm btn-ghost gap-2"
              >
                <VolumeX className="h-4 w-4" />
                Snooze
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteMemo}
        title="Delete Memo"
        message={`Are you sure you want to delete "${selectedMemo?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="error"
      />
    </div>
  );
};

export default EnhancedMemosPage;