import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../store/useThemeStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useChatStore } from '../../store/useChatStore';
import KanbanBoard from '../../components/tasks/KanbanBoard';
import TaskModal from '../../components/modals/TaskModal';
import UserAvatar from '../../components/ui/UserAvatar';
// Placeholder imports for modals/components
// import TaskModal from '../../components/modals/TaskModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import UserInfoSidebar from '../../components/ui/UserInfoSidebar';
import TaskDetailsModal from '../../components/modals/TaskDetailsModal';
// import TaskComments from '../../components/TaskComments';
// import TaskAttachments from '../../components/TaskAttachments';

export default function TasksPage() {
  const { theme } = useThemeStore();
  const { authUser } = useAuthStore();
  const {
    tasks, isTasksLoading, getTasks, createTask, updateTask, deleteTask,
    updateTaskStatus, updateTaskPriority, updateTaskCategory,
    taskActionLoading
  } = useTaskStore();
  const { users, isUsersLoading, getUsers } = useChatStore();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [submittingTask, setSubmittingTask] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [modalTask, setModalTask] = useState(null); // task to edit
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', assignee: '', category: '' });
  const [selectedTask, setSelectedTask] = useState(null);
  const [userInfoSidebar, setUserInfoSidebar] = useState(null); // For showing user info sidebar
  const [showFilters, setShowFilters] = useState(false);

  const categories = [...new Set(tasks.map(task => task.category).filter(Boolean))];

  useEffect(() => {
    getTasks(filters);
    // eslint-disable-next-line
  }, [filters]);

  useEffect(() => {
    getUsers();
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    getTasks({ ...filters, search: e.target.value });
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setModalTask(null);
    setShowTaskModal(true);
  };

  const handleOpenEdit = (task) => {
    if (!task || !task._id) {
      alert('Invalid task selected for editing.');
      console.warn('Edit handler: No valid task._id', task);
      return;
    }
    console.log('Opening edit modal for task:', task._id);
    setModalMode('edit');
    setModalTask(task);
    setShowTaskModal(true);
  };

  const handleCreateTask = async (taskData) => {
    try {
      setSubmittingTask(true);
      await createTask(taskData);
      // Don't close the modal here - let the TaskModal handle it on success
      await getTasks(filters);
    } catch (error) {
      console.error('Error creating task:', error);
      // Re-throw the error so TaskModal can handle it
      throw error;
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleEditTask = async (taskData) => {
    if (!modalTask) return;
    try {
      setSubmittingTask(true);
      await updateTask(modalTask._id, taskData);
      // Don't close the modal here - let the TaskModal handle it on success
      await getTasks(filters);
      setSelectedTask(null); // Close details modal if open
    } catch (error) {
      console.error('Error updating task:', error);
      // Re-throw the error so TaskModal can handle it
      throw error;
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!taskId) {
      alert('Invalid task selected for deletion.');
      console.warn('Delete handler: No valid taskId', taskId);
      return;
    }
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    console.log('Deleting task:', taskId);
    await deleteTask(taskId);
    setSelectedTask(null);
    getTasks(filters);
  };

  // Helper to get user object by ID
  const getUserById = (id) => users.find(u => u._id === id);

  const handleCloseTaskDetails = () => {
    setSelectedTask(null);
    setUserInfoSidebar(null);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const draggedTask = tasks.find(task => task._id === draggableId);
    if (!draggedTask) return;

    // Optimistic UI update
    const updatedTasks = tasks.map(task =>
      task._id === draggableId
        ? { ...task, status: destination.droppableId }
        : task
    );
    useTaskStore.setState({ tasks: updatedTasks });

    try {
      await updateTaskStatus(draggedTask._id, destination.droppableId);
    } catch (error) {
      console.error('Failed to update task status:', error);
      // Revert the optimistic update on error
      useTaskStore.setState({ tasks });
    }
  };

  return (
    <div data-theme={theme} className="min-h-screen bg-base-200">
      <div className="p-6">
        {/* Section: Header and New Task Button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary">Tasks</h1>
          <div className="flex items-center">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
            <button
              className="btn btn-primary px-6 py-2 rounded-full shadow font-medium ml-4 inline-flex"
              onClick={handleOpenCreate}
              title="Create a new task"
            >
              + New Task
            </button>
          </div>
        </div>
        {/* Section: Filters and Search */}
        {showFilters && (
          <div className="flex flex-col md:flex-row gap-4 mb-6 bg-base-100 rounded-lg p-4 shadow-sm items-center">
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={handleSearch}
              className="input input-bordered w-full md:w-1/3"
            />
            <select
              className="select select-bordered"
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              className="select select-bordered"
              value={filters.priority}
              onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <select
              className="select select-bordered"
              value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {/* Quick filter: My Tasks */}
            <button
              className={`btn btn-xs ${filters.assignee === authUser?._id ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilters(f => ({ ...f, assignee: f.assignee === authUser?._id ? '' : authUser?._id }))}
              title="Show only tasks assigned to me"
            >
              My Tasks
            </button>
            <button
              className="btn btn-xs btn-ghost"
              onClick={() => setFilters({ status: '', priority: '', assignee: '', category: '' })}
            >
              Clear Filters
            </button>
          </div>
        )}
        {/* Section: Task List */}
        <div className="bg-base-100 rounded-lg shadow">
          {isTasksLoading ? (
            <div className="text-base-content/70 p-6">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <p className="text-base-content/70 p-6">No tasks found.</p>
          ) : (
            <KanbanBoard tasks={tasks} onDragEnd={onDragEnd} users={users} getUserById={getUserById} onViewTask={setSelectedTask} />
          )}
        </div>
      </div>
      {/* TaskModal for creating or editing a task */}
      <TaskModal
        show={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setModalTask(null);
          setSubmittingTask(false); // Reset loading state when modal is closed
        }}
        onSubmit={modalMode === 'create' ? handleCreateTask : handleEditTask}
        submitting={submittingTask || taskActionLoading.create || taskActionLoading[modalTask?._id]}
        initialTask={modalTask || {}}
        users={users}
        mode={modalMode}
      />
      {/* User Info Sidebar (right-aligned) */}
      <UserInfoSidebar user={userInfoSidebar} onClose={() => setUserInfoSidebar(null)} />
      {/* User Info Modal */}
      {/* Removed User Info Modal as it's now handled by the sidebar */}
      {/* TaskDetailsModal: only render if selectedTask and selectedTask._id exist */}
      {selectedTask && selectedTask._id && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={handleCloseTaskDetails}
          onDelete={handleDeleteTask}
          users={users}
          getUserById={getUserById}
          setUserInfoSidebar={setUserInfoSidebar}
        />
      )}
    </div>
  );
}


