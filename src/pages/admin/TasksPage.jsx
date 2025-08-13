import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../store/useThemeStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useChatStore } from '../../store/useChatStore';
import TaskModal from '../../components/modals/TaskModal';
import UserAvatar from '../../components/ui/UserAvatar';
// Placeholder imports for modals/components
// import TaskModal from '../../components/modals/TaskModal';
// import TaskDetailsModal from '../../components/modals/TaskDetailsModal';
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
  // Remove userInfoModal state, restore userInfoSidebar
  // const [userInfoModal, setUserInfoModal] = useState(null);

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

  return (
    <div data-theme={theme} className="min-h-screen p-6 bg-base-200">
      {/* Section: Header and New Task Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Tasks</h1>
        <button
          className="btn btn-primary px-6 py-2 rounded-full shadow font-medium"
          onClick={handleOpenCreate}
          title="Create a new task"
        >
          + New Task
        </button>
      </div>
      {/* Section: Filters and Search */}
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
        <input
          type="text"
          placeholder="Category"
          className="input input-bordered"
          value={filters.category}
          onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
        />
        {/* Quick filter: My Tasks */}
        <button
          className={`btn btn-xs ${filters.assignee === authUser?._id ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilters(f => ({ ...f, assignee: f.assignee === authUser?._id ? '' : authUser?._id }))}
          title="Show only tasks assigned to me"
        >
          My Tasks
        </button>
      </div>
      {/* Floating New Task Button (mobile) */}
      <button
        className="btn btn-primary fixed bottom-6 right-6 z-40 shadow-lg rounded-full md:hidden"
        onClick={handleOpenCreate}
        title="Create a new task"
      >
        +
      </button>
      {/* Section: Task List */}
      <div className="bg-base-100 rounded-lg shadow p-6">
        {isTasksLoading ? (
          <div className="text-base-content/70">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <p className="text-base-content/70">No tasks found.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map(task => {
              // Status color (no longer used for border)
              // const statusColors = { ... };
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
              const isCompleted = task.status === 'completed';
              return (
                <div
                  key={task._id || task.id}
                  className={`relative group bg-base-200 rounded-xl shadow-md flex flex-col min-h-[180px] transition-all duration-300 cursor-pointer
                    hover:shadow-2xl hover:-rotate-2 hover:scale-[1.025] hover:z-10
                    ${isCompleted ? 'opacity-60' : ''}`}
                  onClick={() => task && task._id && setSelectedTask(task)}
                  title="View task details"
                  style={{ willChange: 'transform, box-shadow' }}
                >
                  {/* Top row: title, status, priority, due date */}
                  <div className="flex items-center justify-between gap-2 px-4 pt-4">
                    <div className="font-bold text-lg text-primary truncate" title={task.title}>{task.title}</div>
                    <div className="flex gap-1 items-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${isCompleted ? 'bg-green-100 text-green-700 border-green-300' : 'bg-base-100 border-base-300 text-base-content'}`}>{task.status ? task.status.replace('_', ' ') : 'todo'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${task.priority === 'urgent' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-base-100 border-base-300 text-base-content'}`}>{task.priority || 'medium'}</span>
                      {task.dueDate && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${isOverdue ? 'bg-red-100 text-red-700 border-red-300' : 'bg-base-100 border-base-300 text-base-content'}`} title="Due date">
                          {isOverdue ? <span className="text-red-600 font-bold mr-1" title="Overdue">⚠</span> : null}
                          {isOverdue ? 'Overdue: ' : ''}{new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Middle: description */}
                  <div className="px-4 py-2 text-sm text-base-content/80 truncate" title={task.description}>
                    {task.description?.length > 120 ? task.description.slice(0, 120) + '…' : task.description}
                  </div>
                  {/* Bottom: assigned users, category, actions */}
                  <div className="flex items-center justify-between px-4 pb-4 mt-auto">
                    <div className="flex items-center gap-1">
                      {/* Assigned user avatars */}
                      {Array.isArray(task.assignedTo) ? task.assignedTo.map(uid => {
                        // If uid is an object, extract its _id or id property
                        const userId = typeof uid === 'object' ? uid._id || uid.id || JSON.stringify(uid) : uid;
                        const user = getUserById(userId);
                        if (!user) return null;
                        return (
                          <UserAvatar
                            key={userId}
                            user={user}
                            size="w-8 h-8"
                            textSize="text-xs"
                            showTooltip={true}
                            onClick={setUserInfoSidebar}
                          />
                        );
                      }) : null}


                      {task.category && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold border border-base-300 bg-base-100 text-base-content" title="Category">
                          {task.category}
                        </span>
                      )}
                    </div>
                    {/* Quick actions: edit/delete, only visible on hover */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        className="btn btn-xs btn-secondary"
                        title="Edit task"
                        onClick={e => { e.stopPropagation(); handleOpenEdit(task); }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-xs btn-error"
                        title="Delete task"
                        onClick={e => { e.stopPropagation(); handleDeleteTask(task._id); }}
                        disabled={taskActionLoading[task._id]}
                      >
                        {taskActionLoading[task._id] ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                  {/* Completed checkmark overlay */}
                  {isCompleted && (
                    <div className="absolute top-2 right-2 text-green-500 text-xl" title="Completed">✔</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
        submitting={submittingTask}
        initialTask={modalTask || {}}
        users={users}
        mode={modalMode}
      />
      {/* User Info Sidebar (right-aligned) */}
      {userInfoSidebar && (
        <div className="fixed inset-0 z-50 flex justify-end items-stretch pointer-events-none">
          <div className="bg-base-100 shadow-2xl w-full max-w-md h-full flex flex-col gap-6 p-8 border-l-2 border-primary pointer-events-auto animate-slide-in-right relative transition-all duration-300">
            <button
              className="btn btn-sm absolute top-4 right-4 z-10"
              onClick={() => setUserInfoSidebar(null)}
            >
              Close
            </button>
            <div className="flex flex-col items-center gap-2 mt-6">
              {userInfoSidebar.profilePicture && userInfoSidebar.profilePicture.trim() !== "" ? (
                <img
                  src={userInfoSidebar.profilePicture}
                  alt={userInfoSidebar.name || userInfoSidebar.email}
                  className="w-24 h-24 rounded-full border-2 border-primary shadow"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-2 border-primary bg-base-300 flex items-center justify-center text-4xl font-bold text-primary shadow">
                  {(userInfoSidebar.name || userInfoSidebar.email || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
              <div className="text-2xl font-bold mt-2">{userInfoSidebar.name || userInfoSidebar.email}</div>
              <div className="text-base-content/70 text-lg">{userInfoSidebar.email}</div>
              <div className="text-base-content/70 text-base">Role: <span className="font-semibold">{userInfoSidebar.role || 'N/A'}</span></div>
            </div>
            <div className="mt-8">
              <div className="font-semibold text-base mb-2 border-b pb-1 border-base-300">User Details</div>
              <div className="text-sm text-base-content/80 space-y-1">
                {/* Add more user info here if available */}
                <div><span className="font-semibold">Email:</span> {userInfoSidebar.email}</div>
                <div><span className="font-semibold">Role:</span> {userInfoSidebar.role || 'N/A'}</div>
                {/* Add more fields as needed */}
              </div>
            </div>
          </div>
          {/* Click outside to close */}
          <div className="flex-1" onClick={() => setUserInfoSidebar(null)} />
        </div>
      )}
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

// Redesign TaskDetailsModal for a modern, beautiful look
function TaskDetailsModal({ task, onClose, onDelete, users, getUserById, setUserInfoSidebar }) {
  const { getTaskAuditLog, addTaskComment, getTaskComments, uploadTaskAttachment, listTaskAttachments, deleteTaskAttachment } = useTaskStore();
  const [tab, setTab] = useState('comments');
  const [auditLog, setAuditLog] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoadingAudit(true);
    getTaskAuditLog(task._id).then(log => {
      if (mounted) setAuditLog(log);
    }).finally(() => setLoadingAudit(false));
    return () => { mounted = false; };
  }, [task._id, getTaskAuditLog]);

  useEffect(() => {
    if (tab === 'comments') {
      setLoadingComments(true);
      getTaskComments(task._id)
        .then(comments => setComments(comments))
        .catch(() => setComments([]))
        .finally(() => setLoadingComments(false));
    }
  }, [tab, task._id, getTaskComments]);

  useEffect(() => {
    if (tab === 'attachments') {
      setLoadingAttachments(true);
      listTaskAttachments(task._id)
        .then(files => setAttachments(files))
        .catch(() => setAttachments([]))
        .finally(() => setLoadingAttachments(false));
    }
  }, [tab, task._id, listTaskAttachments]);

  const assigneeNames = (task.assignees || []).map(
    id => users.find(u => u._id === id)?.name || users.find(u => u._id === id)?.email || id
  ).join(', ');

  const handleAddComment = async (e) => {
    e.preventDefault();
    setSubmittingComment(true);
    setCommentError(null);
    try {
      await addTaskComment(task._id, commentText);
      setCommentText('');
      // Refresh comments
      setLoadingComments(true);
      const newComments = await getTaskComments(task._id);
      setComments(newComments);
    } catch (err) {
      setCommentError('Failed to add comment');
    } finally {
      setSubmittingComment(false);
      setLoadingComments(false);
    }
  };

  const handleUploadAttachment = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAttachment(true);
    setAttachmentError(null);
    try {
      await uploadTaskAttachment(task._id, file);
      // Refresh attachments
      setLoadingAttachments(true);
      const newFiles = await listTaskAttachments(task._id);
      setAttachments(newFiles);
    } catch (err) {
      setAttachmentError('Failed to upload attachment');
    } finally {
      setUploadingAttachment(false);
      setLoadingAttachments(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    setAttachmentError(null);
    try {
      await deleteTaskAttachment(task._id, attachmentId);
      // Refresh attachments
      setLoadingAttachments(true);
      const newFiles = await listTaskAttachments(task._id);
      setAttachments(newFiles);
    } catch (err) {
      setAttachmentError('Failed to delete attachment');
    } finally {
      setLoadingAttachments(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-base-100 p-0 rounded-xl shadow-2xl w-[95vw] max-w-2xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center px-6 pt-6 pb-2 border-b border-base-300 bg-base-200">
          <h2 className="text-2xl font-bold">Task Details</h2>
          <button className="btn btn-sm" onClick={onClose}>Close</button>
        </div>
        {/* Delete button with confirmation */}
        <div className="flex justify-end px-6 pt-2">
          <button
            className="btn btn-xs btn-error"
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this task?')) {
                await onDelete(task._id);
              }
            }}
          >
            Delete Task
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-6 p-6">
          {/* Left: Task Info */}
          <div className="flex-1 min-w-[250px] space-y-6 bg-base-100 rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-2xl text-primary">{task.title}</div>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose} title="Close"><span className="text-xl">×</span></button>
            </div>
            {/* Assignees */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-base-content/80">Assignees</span>
                <span className="badge badge-primary badge-sm">{(task.assignedTo || []).length}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(task.assignedTo || []).map(uid => {
                  const userId = typeof uid === 'object' ? uid._id || uid.id || JSON.stringify(uid) : uid;
                  const user = getUserById(userId);
                  if (!user) return null;
                  return (
                    <UserAvatar
                      key={userId}
                      user={user}
                      size="w-10 h-10"
                      textSize="text-base"
                      onClick={setUserInfoSidebar}
                    />
                  );
                })}
              </div>
            </div>
            {/* Task Properties */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border border-base-300 bg-base-200 text-xs">
                <span className="material-icons text-base-content/60 text-sm">flag</span> {task.status}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border border-base-300 bg-base-200 text-xs">
                <span className="material-icons text-base-content/60 text-sm">priority_high</span> {task.priority}
              </span>
              {task.category && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border border-base-300 bg-base-200 text-xs">
                  <span className="material-icons text-base-content/60 text-sm">category</span> {task.category}
                </span>
              )}
              {task.dueDate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border border-base-300 bg-base-200 text-xs">
                  <span className="material-icons text-base-content/60 text-sm">event</span> {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
              {task.recurrence?.frequency && task.recurrence.frequency !== 'none' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border border-base-300 bg-base-200 text-xs">
                  <span className="material-icons text-base-content/60 text-sm">repeat</span> {task.recurrence.frequency}
                </span>
              )}
            </div>
            {/* Description */}
            <div className="mb-2">
              <div className="font-medium text-base-content/80 mb-1">Description</div>
              <div className="text-base-content/90 whitespace-pre-line bg-base-200 rounded p-3 shadow-inner min-h-[48px]">{task.description || <span className="text-base-content/40">No description</span>}</div>
            </div>
          </div>
          {/* Right: Tabs (Details, Comments, Attachments, Activity) */}
          <div className="w-full md:w-80 bg-base-200 rounded-xl p-4 flex flex-col gap-2 border-l border-base-300">
            <div className="flex gap-2 border-b pb-2 mb-2">
              <button className={`btn btn-xs ${tab === 'comments' ? 'btn-primary' : ''}`} onClick={() => setTab('comments')}>Comments</button>
              <button className={`btn btn-xs ${tab === 'attachments' ? 'btn-primary' : ''}`} onClick={() => setTab('attachments')}>Attachments</button>
              <button className={`btn btn-xs ${tab === 'activity' ? 'btn-primary' : ''}`} onClick={() => setTab('activity')}>Activity</button>
            </div>
            {tab === 'comments' && (
              <div className="bg-base-100 rounded-lg p-3 shadow-inner">
                <div className="font-semibold mb-2">Comments</div>
                <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    disabled={submittingComment}
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingComment || !commentText.trim()}
                  >
                    {submittingComment ? 'Adding...' : 'Add'}
                  </button>
                </form>
                {commentError && <div className="text-error text-sm mb-2">{commentError}</div>}
                {loadingComments ? (
                  <div className="text-base-content/70">Loading comments...</div>
                ) : comments.length === 0 ? (
                  <div className="text-base-content/70">No comments yet.</div>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {comments.map((c) => {
                      // Fix: Correctly access the comment text using c.text instead of c.comment
                      const commentText = c.text || c.comment || "";
                      const user = c.user && typeof c.user === 'object'
                        ? c.user
                        : users.find(u => u._id === c.user) || {};

                      return (
                        <li key={c._id || c.id} className="border-b pb-1">
                          <div className="flex items-center gap-2 mb-1">
                            {user.profilePicture && user.profilePicture.trim() !== "" ? (
                              <img src={user.profilePicture} alt={user.name || user.email || 'User'} className="w-6 h-6 rounded-full border border-primary" />
                            ) : (
                              <div className="w-6 h-6 rounded-full border border-primary bg-base-300 flex items-center justify-center text-xs font-bold text-primary">
                                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="font-semibold text-xs text-primary">{user.name || user.email || 'User'}</span>
                            <span className="text-xs text-base-content/60">{new Date(c.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="text-sm whitespace-pre-wrap">{commentText}</div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
            {tab === 'attachments' && (
              <div className="bg-base-100 rounded-lg p-3 shadow-inner">
                <div className="font-semibold mb-2">Attachments</div>
                <div className="flex items-center gap-2 mb-4">
                  <label className="btn btn-secondary btn-sm">
                    {uploadingAttachment ? 'Uploading...' : 'Upload File'}
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleUploadAttachment}
                      disabled={uploadingAttachment}
                    />
                  </label>
                  {attachmentError && <span className="text-error text-sm">{attachmentError}</span>}
                </div>
                {loadingAttachments ? (
                  <div className="text-base-content/70">Loading attachments...</div>
                ) : attachments.length === 0 ? (
                  <div className="text-base-content/70">No attachments yet.</div>
                ) : (
                  <div className="space-y-4 max-h-72 overflow-y-auto">
                    {attachments.map((a) => {
                      // Determine file type for preview
                      const isImage = a.mimetype?.startsWith('image/') ||
                        /\.(jpg|jpeg|png|gif|webp)$/i.test(a.filename || a.name || '');

                      const isPDF = a.mimetype === 'application/pdf' ||
                        /\.pdf$/i.test(a.filename || a.name || '');

                      const isVideo = a.mimetype?.startsWith('video/') ||
                        /\.(mp4|webm|avi|mov)$/i.test(a.filename || a.name || '');

                      const isAudio = a.mimetype?.startsWith('audio/') ||
                        /\.(mp3|wav|ogg)$/i.test(a.filename || a.name || '');

                      return (
                        <div key={a._id || a.id} className="border border-base-300 rounded-lg overflow-hidden">
                          {/* Preview based on file type */}
                          {isImage && (
                            <div className="w-full h-40 overflow-hidden bg-base-200">
                              <img
                                src={a.url}
                                alt={a.filename || a.name || 'File'}
                                className="w-full h-full object-contain"
                                loading="lazy"
                              />
                            </div>
                          )}
                          {isPDF && (
                            <div className="w-full h-40 bg-base-200 flex items-center justify-center">
                              <iframe
                                src={`${a.url}#view=FitH`}
                                title={a.filename || a.name || 'PDF document'}
                                className="w-full h-full"
                              />
                            </div>
                          )}
                          {isVideo && (
                            <div className="w-full bg-black">
                              <video
                                controls
                                className="w-full max-h-40"
                                src={a.url}
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          )}

                          {isAudio && (
                            <div className="p-4 bg-base-200">
                              <audio
                                controls
                                className="w-full"
                                src={a.url}
                              >
                                Your browser does not support the audio tag.
                              </audio>
                            </div>
                          )}

                          {/* For other file types or if no preview available */}
                          {!isImage && !isPDF && !isVideo && !isAudio && (
                            <div className="p-4 bg-base-200 flex items-center justify-center h-20">
                              <p className="text-sm text-base-content/70 text-center">
                                Preview not available for this file type
                              </p>
                            </div>
                          )}

                          <div className="p-3 bg-base-100 border-t border-base-300">
                            <div className="flex justify-between items-center">
                              <div className="truncate flex-1">
                                <p className="font-medium truncate">{a.filename || a.name || 'File'}</p>
                                <p className="text-xs text-base-content/60">
                                  {((a.size || 0) / 1024).toFixed(1)} KB • Uploaded {a.uploadedAt ? new Date(a.uploadedAt).toLocaleString() : 'recently'}
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <a
                                  href={a.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-xs btn-secondary"
                                  title="Open file"
                                >
                                  Open
                                </a>
                                <button
                                  className="btn btn-xs btn-error"
                                  onClick={() => handleDeleteAttachment(a._id)}
                                  disabled={uploadingAttachment}
                                  title="Delete attachment"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {tab === 'activity' && (
              <div className="bg-base-100 rounded-lg p-3 shadow-inner max-h-60 overflow-y-auto">
                <div className="font-semibold mb-2">Activity Log</div>
                {loadingAudit ? (
                  <div className="text-base-content/70">Loading activity...</div>
                ) : auditLog.length === 0 ? (
                  <div className="text-base-content/70">No activity found.</div>
                ) : (
                  <ul className="space-y-2">
                    {auditLog.map((log, index) => {
                      // Format date safely - handle invalid dates
                      const formattedDate = log.timestamp || log.createdAt || log.updatedAt
                        ? new Date(log.timestamp || log.createdAt || log.updatedAt).toLocaleString()
                        : 'Unknown date';

                      // Use a reliable key
                      const key = log._id || log.id || `activity-${index}`;
                      return (
                        <li key={key} className="border-b pb-1">
                          <div className="text-xs text-base-content/60">
                            {formattedDate !== 'Invalid Date' ? formattedDate : 'Date not available'}
                          </div>
                          <div className="text-sm">{log.action} {log.details && `- ${log.details}`}</div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
