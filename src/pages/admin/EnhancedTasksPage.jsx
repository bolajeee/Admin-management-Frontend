import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Paperclip,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  FileText,
  Send,
  ArrowRight,
  Flag,
  Star,
  Archive
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { axiosInstance } from '../../lib/axios';
import { useTaskStore } from '../../store/useTaskStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import DataTable from '../../components/ui/DataTable';
import Modal, { FormModal, ConfirmationModal } from '../../components/ui/Modal';
import UserAvatar from '../../components/ui/UserAvatar';
import toast from 'react-hot-toast';

const EnhancedTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // table, kanban, calendar
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskStats, setTaskStats] = useState({});
  const [analyticsData, setAnalyticsData] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    category: '',
    dueDate: '',
    status: 'todo',
    tags: [],
    attachments: [],
    comments: []
  });

  const { authUser } = useAuthStore();
  const { users, getUsers } = useChatStore();

  // Kanban columns
  const kanbanColumns = {
    todo: { title: 'To Do', color: 'bg-gray-100' },
    'in-progress': { title: 'In Progress', color: 'bg-blue-100' },
    blocked: { title: 'Blocked', color: 'bg-red-100' },
    completed: { title: 'Completed', color: 'bg-green-100' },
    cancelled: { title: 'Cancelled', color: 'bg-gray-200' }
  };

  useEffect(() => {
    fetchTasks();
    fetchTaskStats();
    fetchAnalytics();
    getUsers();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/tasks');
      setTasks(response.data.tasks || []);
    } catch (error) {
      toast.error('Failed to fetch tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskStats = async () => {
    try {
      const response = await axiosInstance.get('/tasks/count');
      setTaskStats(response.data);
    } catch (error) {
      console.error('Error fetching task stats:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axiosInstance.get('/tasks/analytics/completed');
      setAnalyticsData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchComments = async (taskId) => {
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}/comments`);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchAttachments = async (taskId) => {
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}/attachments`);
      setAttachments(response.data.attachments || []);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/tasks', formData);
      setShowCreateModal(false);
      resetForm();
      fetchTasks();
      fetchTaskStats();
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create task');
      console.error('Error creating task:', error);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.patch(`/tasks/${selectedTask._id}`, formData);
      setShowEditModal(false);
      setSelectedTask(null);
      resetForm();
      fetchTasks();
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Failed to update task');
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await axiosInstance.delete(`/tasks/${selectedTask._id}`);
      setShowDeleteModal(false);
      setSelectedTask(null);
      fetchTasks();
      fetchTaskStats();
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axiosInstance.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId !== destination.droppableId) {
      handleStatusChange(draggableId, destination.droppableId);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;

    try {
      await axiosInstance.post(`/tasks/${selectedTask._id}/comments`, {
        text: newComment.trim()
      });
      setNewComment('');
      fetchComments(selectedTask._id);
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleDelegateTask = async (taskId, newAssignee) => {
    try {
      await axiosInstance.patch(`/tasks/${taskId}/delegate`, {
        assignedTo: newAssignee
      });
      fetchTasks();
      toast.success('Task delegated successfully');
    } catch (error) {
      toast.error('Failed to delegate task');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      category: '',
      dueDate: '',
      status: 'todo',
      tags: [],
      attachments: [],
      comments: []
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo?._id || '',
      priority: task.priority,
      category: task.category || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      status: task.status,
      tags: task.tags || []
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (task) => {
    setSelectedTask(task);
    setShowDeleteModal(true);
  };

  const openViewModal = (task) => {
    setSelectedTask(task);
    fetchComments(task._id);
    fetchAttachments(task._id);
    setShowViewModal(true);
  };

  const openCommentsModal = (task) => {
    setSelectedTask(task);
    fetchComments(task._id);
    setShowCommentsModal(true);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-error" />;
      case 'high':
        return <Flag className="h-4 w-4 text-warning" />;
      case 'medium':
        return <Target className="h-4 w-4 text-info" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <Target className="h-4 w-4 text-info" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const classes = {
      critical: 'badge-error',
      high: 'badge-warning',
      medium: 'badge-info',
      low: 'badge-success'
    };
    return `badge ${classes[priority] || 'badge-info'}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-info" />;
      case 'review':
        return <Eye className="h-4 w-4 text-warning" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-error" />;
      default:
        return <Clock className="h-4 w-4 text-base-content/60" />;
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      completed: 'badge-success',
      'in-progress': 'badge-info',
      review: 'badge-warning',
      cancelled: 'badge-error',
      pending: 'badge-ghost'
    };
    return `badge ${classes[status] || 'badge-ghost'}`;
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'my-tasks') return matchesSearch && task.assignedTo?._id === authUser._id;
    if (filter === 'overdue') {
      return matchesSearch && task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
    }
    return matchesSearch && task.status === filter;
  });

  const columns = [
    {
      key: 'priority',
      label: 'Priority',
      render: (priority) => (
        <div className="flex items-center gap-2">
          {getPriorityIcon(priority)}
          <span className={`badge badge-sm ${getPriorityBadge(priority)}`}>
            {priority.toUpperCase()}
          </span>
        </div>
      ),
      className: 'w-24'
    },
    {
      key: 'title',
      label: 'Task',
      render: (title, task) => (
        <div>
          <div className="font-medium text-base-content">{title}</div>
          <div className="text-sm text-base-content/60 truncate max-w-xs">
            {task.description}
          </div>
          {task.tags && task.tags.length > 0 && (
            <div className="flex gap-1 mt-1">
              {task.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="badge badge-xs badge-outline">
                  {tag}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="badge badge-xs badge-outline">
                  +{task.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      render: (assignedTo) => (
        assignedTo ? (
          <div className="flex items-center gap-2">
            <UserAvatar user={assignedTo} size="w-6 h-6" />
            <span className="text-sm">{assignedTo.name || assignedTo.email}</span>
          </div>
        ) : (
          <span className="text-sm text-base-content/60">Unassigned</span>
        )
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <span className={`badge badge-sm ${getStatusBadge(status)}`}>
            {status.replace('-', ' ').toUpperCase()}
          </span>
        </div>
      )
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (dueDate, task) => {
        if (!dueDate) return <span className="text-sm text-base-content/60">No due date</span>;
        
        const due = new Date(dueDate);
        const now = new Date();
        const isOverdue = due < now && task.status !== 'completed';
        const isDueSoon = due - now < 24 * 60 * 60 * 1000 && due > now;
        
        return (
          <div className="text-sm">
            <div className={`${isOverdue ? 'text-error' : isDueSoon ? 'text-warning' : ''}`}>
              {due.toLocaleDateString()}
            </div>
            <div className="text-xs text-base-content/60">
              {due.toLocaleTimeString()}
            </div>
            {isOverdue && (
              <span className="badge badge-error badge-xs mt-1">Overdue</span>
            )}
            {isDueSoon && !isOverdue && (
              <span className="badge badge-warning badge-xs mt-1">Due Soon</span>
            )}
          </div>
        );
      }
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
    }
  ];

  const TaskCard = ({ task, index }) => (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-base-100 rounded-lg p-4 mb-3 shadow-sm border border-base-300 hover:shadow-md transition-shadow ${
            snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getPriorityIcon(task.priority)}
              <h4 className="font-medium text-base-content truncate">{task.title}</h4>
            </div>
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
                <MoreVertical className="h-3 w-3" />
              </button>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                <li><button onClick={() => openViewModal(task)}>View</button></li>
                <li><button onClick={() => openEditModal(task)}>Edit</button></li>
                <li><button onClick={() => openCommentsModal(task)}>Comments</button></li>
                <li><button onClick={() => openDeleteModal(task)} className="text-error">Delete</button></li>
              </ul>
            </div>
          </div>
          
          {task.description && (
            <p className="text-sm text-base-content/70 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {task.assignedTo && (
                <UserAvatar user={task.assignedTo} size="w-5 h-5" />
              )}
              {task.commentsCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-base-content/60">
                  <MessageSquare className="h-3 w-3" />
                  {task.commentsCount}
                </div>
              )}
              {task.attachmentsCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-base-content/60">
                  <Paperclip className="h-3 w-3" />
                  {task.attachmentsCount}
                </div>
              )}
            </div>
            
            {task.dueDate && (
              <div className="text-xs text-base-content/60">
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content flex items-center gap-3">
            <CheckSquare className="h-7 w-7 text-primary" />
            Task Management
          </h1>
          <p className="text-base-content/60 mt-1">
            Organize, assign, and track project tasks
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="join">
            <button
              onClick={() => setViewMode('table')}
              className={`btn btn-sm join-item ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`btn btn-sm join-item ${viewMode === 'kanban' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <Target className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`btn btn-sm join-item ${viewMode === 'calendar' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <Calendar className="h-4 w-4" />
            </button>
          </div>
          
          <button
            onClick={openCreateModal}
            className="btn btn-primary btn-sm gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Task
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
              <p className="text-blue-100 text-sm">Total Tasks</p>
              <p className="text-2xl font-bold">{tasks.length}</p>
            </div>
            <CheckSquare className="h-8 w-8 text-blue-200" />
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
              <p className="text-green-100 text-sm">Completed</p>
              <p className="text-2xl font-bold">
                {tasks.filter(t => t.status === 'completed').length}
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
              <p className="text-yellow-100 text-sm">In Progress</p>
              <p className="text-2xl font-bold">
                {tasks.filter(t => t.status === 'in-progress').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Overdue</p>
              <p className="text-2xl font-bold">
                {tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-200" />
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
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'my-tasks', 'pending', 'in-progress', 'review', 'completed', 'overdue'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`btn btn-sm whitespace-nowrap ${
                filter === filterOption ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              {filterOption.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'table' && (
        <DataTable
          data={filteredTasks}
          columns={columns}
          loading={loading}
          title="Tasks"
          searchable={false}
          filterable={false}
          sortable={true}
          pagination={true}
          pageSize={10}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onView={openViewModal}
          onRefresh={fetchTasks}
        />
      )}

      {viewMode === 'kanban' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(kanbanColumns).map(([columnId, column]) => (
              <div key={columnId} className="bg-base-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-base-content">{column.title}</h3>
                  <span className="badge badge-sm">
                    {filteredTasks.filter(task => task.status === columnId).length}
                  </span>
                </div>
                
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-primary/10' : ''
                      }`}
                    >
                      {filteredTasks
                        .filter(task => task.status === columnId)
                        .map((task, index) => (
                          <TaskCard key={task._id} task={task} index={index} />
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {viewMode === 'calendar' && (
        <div className="bg-base-100 rounded-lg p-6 shadow">
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-base-content mb-2">
              Calendar View
            </h3>
            <p className="text-base-content/60">
              Calendar view is coming soon. Use table or kanban view for now.
            </p>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
        onSubmit={handleCreateTask}
        submitText="Create Task"
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
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-24"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Assign To</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                <option value="">Select user...</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Priority</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Category</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Development, Design, Marketing"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Due Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
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
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Tags (comma separated)</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g., urgent, frontend, bug-fix"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData({ 
                ...formData, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
              })}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Attachments</span>
            </label>
            <input
              type="file"
              className="file-input file-input-bordered w-full"
              multiple
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setFormData({ ...formData, attachments: files });
              }}
            />
            <div className="label">
              <span className="label-text-alt">Supported: PDF, DOC, DOCX, TXT, JPG, PNG</span>
            </div>
          </div>
        </div>
      </FormModal>

      {/* Edit Task Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Task"
        onSubmit={handleEditTask}
        submitText="Update Task"
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
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-24"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Assign To</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                <option value="">Select user...</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Priority</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Category</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Development, Design, Marketing"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Due Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
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
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </FormModal>

      {/* View Task Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Task Details"
        size="xl"
      >
        {selectedTask && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getPriorityIcon(selectedTask.priority)}
                  <h2 className="text-xl font-semibold">{selectedTask.title}</h2>
                  <span className={`badge ${getPriorityBadge(selectedTask.priority)}`}>
                    {selectedTask.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-base-content/70">{selectedTask.description}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedTask.status)}
                <span className={`badge ${getStatusBadge(selectedTask.status)}`}>
                  {selectedTask.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-base-content/70">Assigned To</label>
                <div className="flex items-center gap-2 mt-1">
                  {selectedTask.assignedTo ? (
                    <>
                      <UserAvatar user={selectedTask.assignedTo} size="w-6 h-6" />
                      <span>{selectedTask.assignedTo.name || selectedTask.assignedTo.email}</span>
                    </>
                  ) : (
                    <span className="text-base-content/60">Unassigned</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-base-content/70">Due Date</label>
                <p className="mt-1">
                  {selectedTask.dueDate 
                    ? new Date(selectedTask.dueDate).toLocaleDateString()
                    : 'No due date'
                  }
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-base-content/70">Category</label>
                <p className="mt-1">{selectedTask.category || 'No category'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-base-content/70">Created</label>
                <p className="mt-1">{new Date(selectedTask.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t border-base-300 pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments ({comments.length})
              </h3>
              
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    <UserAvatar user={comment.author} size="w-6 h-6" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {comment.author?.name || comment.author?.email}
                        </span>
                        <span className="text-xs text-base-content/60">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-base-content/80">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="input input-bordered flex-1 input-sm"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="btn btn-primary btn-sm"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Attachments Section */}
            {attachments.length > 0 && (
              <div className="border-t border-base-300 pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Attachments ({attachments.length})
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {attachments.map((attachment) => (
                    <div key={attachment._id} className="flex items-center gap-2 p-2 bg-base-200 rounded">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm truncate">{attachment.filename}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Comments Modal */}
      <Modal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        title="Task Comments"
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-4">
            <div className="border-b border-base-300 pb-3">
              <h3 className="font-semibold">{selectedTask.title}</h3>
              <p className="text-sm text-base-content/60">{selectedTask.description}</p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-3">
                  <UserAvatar user={comment.author} size="w-8 h-8" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {comment.author?.name || comment.author?.email}
                      </span>
                      <span className="text-xs text-base-content/60">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-base-content/80">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 pt-3 border-t border-base-300">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="input input-bordered flex-1"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="btn btn-primary"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${selectedTask?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="error"
      />
    </div>
  );
};

export default EnhancedTasksPage;