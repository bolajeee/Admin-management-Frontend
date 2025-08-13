import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useTaskStore = create((set, get) => ({
    tasks: [],
    userTasks: [],
    isTasksLoading: false,
    isUserTasksLoading: false,
    taskActionLoading: {},
    taskError: null,

    // Fetch all tasks (with optional filters)
    getTasks: async (filters = {}) => {
        set({ isTasksLoading: true });
        try {
            const res = await axiosInstance.get('/tasks', { params: filters });
            const tasks = Array.isArray(res.data) ? res.data : 
                         Array.isArray(res.data.data) ? res.data.data : [];
            // Normalize _id for all tasks
            set({ tasks: tasks.map(t => ({ ...t, _id: t._id || t.id })) });
        } catch (error) {
            console.error('Error fetching tasks:', error);
            console.log('Error response:', error.response?.data);
            set({ taskError: error, tasks: [] });
            toast.error(error.response?.data?.message || "Error fetching tasks");
        } finally {
            set({ isTasksLoading: false });
        }
    },

    // Fetch present user tasks
    getUserTasks: async (userId) => {
        set({ isUserTasksLoading: true });
        try {
            const res = await axiosInstance.get(`/tasks/getUserTasks/${userId}`);
            // Normalize _id for all user tasks
            set({ userTasks: res.data.map(t => ({ ...t, _id: t._id || t.id })) });
            toast.success("User tasks fetched successfully");
        } catch (error) {
            set({ userTasks: [] });
            toast.error("Error fetching user tasks");
        } finally {
            set({ isUserTasksLoading: false });
        }
    },

    // Create a new task
    createTask: async (taskData) => {
        set(state => ({ taskActionLoading: { ...state.taskActionLoading, create: true } }));
        try {
            console.log('Creating task with data:', taskData);
            const res = await axiosInstance.post('/tasks', taskData);
            
            // Normalize _id for the new task
            const newTask = { ...res.data, _id: res.data._id || res.data.id };
            set(state => ({ 
                tasks: [newTask, ...state.tasks],
                userTasks: [newTask, ...state.userTasks] 
            }));
            toast.success("Task created successfully");
            return newTask;
        } catch (error) {
            console.error('Error creating task:', error);
            console.log('Task creation response:', error.response?.data);
            
            const errorMessage = error.response?.data?.message || 'Failed to create task';
            const errors = error.response?.data?.errors;
            
            if (errors?.length) {
                errors.forEach(msg => {
                    const errorMsg = typeof msg === 'string' ? msg : JSON.stringify(msg);
                    console.log('Validation error:', errorMsg);
                    toast.error(errorMsg);
                });
            } else {
                console.log('Error message:', errorMessage);
                toast.error(errorMessage);
            }
            throw error;
        } finally {
            set(state => ({ taskActionLoading: { ...state.taskActionLoading, create: false } }));
        }
    },

    // Update a task
    updateTask: async (taskId, updates) => {
        if (!taskId) {
            console.error('updateTask called without taskId');
            toast.error('Invalid task ID');
            return;
        }

        set(state => ({ taskActionLoading: { ...state.taskActionLoading, [taskId]: true } }));
        try {
            console.log('Updating task:', taskId, 'with updates:', updates);
            const res = await axiosInstance.patch(`/tasks/${taskId}`, updates);
            
            // Ensure we have valid response data
            if (!res.data) {
                throw new Error('No data received from server');
            }

            // Normalize _id and create updated task object
            const updatedTask = { 
                ...res.data, 
                _id: res.data._id || res.data.id,
                status: res.data.status || 'todo',
                priority: res.data.priority || 'medium'
            };

            // Update both tasks and userTasks arrays
            set(state => ({ 
                tasks: state.tasks.map(t => t._id === taskId ? updatedTask : t),
                userTasks: state.userTasks.map(t => t._id === taskId ? updatedTask : t)
            }));

            toast.success("Task updated successfully");
            return updatedTask;
        } catch (error) {
            console.error('Error updating task:', error);
            console.log('Error response:', error.response?.data);

            // Handle specific error cases
            if (error.response?.status === 401) {
                toast.error("Please login again to continue");
                // Let axios interceptor handle the redirect
            } else if (error.response?.status === 403) {
                toast.error("You don't have permission to update this task");
            } else {
                const errorMessage = error.response?.data?.message || "Error updating task";
                toast.error(errorMessage);
            }

            throw error;
        } finally {
            set(state => ({ taskActionLoading: { ...state.taskActionLoading, [taskId]: false } }));
        }
    },

    // Delete a task
    deleteTask: async (taskId) => {
        set(state => ({ taskActionLoading: { ...state.taskActionLoading, [taskId]: true } }));
        try {
            await axiosInstance.delete(`/tasks/${taskId}`);
            set(state => ({ tasks: state.tasks.filter(t => t._id !== taskId) }));
            toast.success("Task deleted");
        } catch (error) {
            toast.error("Error deleting task");
        } finally {
            set(state => ({ taskActionLoading: { ...state.taskActionLoading, [taskId]: false } }));
        }
    },

    // Update status/priority/category
    updateTaskStatus: async (taskId, status) => get().updateTask(taskId, { status }),
    updateTaskPriority: async (taskId, priority) => get().updateTask(taskId, { priority }),
    updateTaskCategory: async (taskId, category) => get().updateTask(taskId, { category }),

    // Comments
    addTaskComment: async (taskId, comment) => {
        set(state => ({ taskActionLoading: { ...state.taskActionLoading, [taskId + '_comment']: true } }));
        try {
            await axiosInstance.post(`/tasks/${taskId}/comments`, { comment });
            toast.success("Comment added");
        } catch (error) {
            toast.error("Error adding comment");
        } finally {
            set(state => ({ taskActionLoading: { ...state.taskActionLoading, [taskId + '_comment']: false } }));
        }
    },
    getTaskComments: async (taskId) => {
        try {
            const res = await axiosInstance.get(`/tasks/${taskId}/comments`);
            return res.data;
        } catch (error) {
            toast.error("Error fetching comments");
            return [];
        }
    },

    // Attachments
    uploadTaskAttachment: async (taskId, file) => {
        set(state => ({ taskActionLoading: { ...state.taskActionLoading, [taskId + '_attach']: true } }));
        try {
            const formData = new FormData();
            formData.append('file', file);
            await axiosInstance.post(`/tasks/${taskId}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Attachment uploaded");
        } catch (error) {
            toast.error("Error uploading attachment");
        } finally {
            set(state => ({ taskActionLoading: { ...state.taskActionLoading, [taskId + '_attach']: false } }));
        }
    },
    listTaskAttachments: async (taskId) => {
        try {
            const res = await axiosInstance.get(`/tasks/${taskId}/attachments`);
            return res.data;
        } catch (error) {
            toast.error("Error fetching attachments");
            return [];
        }
    },
    deleteTaskAttachment: async (taskId, attachmentId) => {
        set(state => ({ taskActionLoading: { ...state.taskActionLoading, [taskId + '_attach']: true } }));
        try {
            await axiosInstance.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
            toast.success("Attachment deleted");
        } catch (error) {
            toast.error("Error deleting attachment");
        } finally {
            set(state => ({ taskActionLoading: { ...state.taskActionLoading, [taskId + '_attach']: false } }));
        }
    },

    // Recurrence
    updateTaskRecurrence: async (taskId, recurrence) => get().updateTask(taskId, { recurrence }),

    // Memo linking
    linkMemoToTask: async (taskId, memoId) => {
        try {
            await axiosInstance.post(`/tasks/${taskId}/memos/${memoId}`);
            toast.success("Memo linked to task");
        } catch (error) {
            toast.error("Error linking memo");
        }
    },
    unlinkMemoFromTask: async (taskId, memoId) => {
        try {
            await axiosInstance.delete(`/tasks/${taskId}/memos/${memoId}`);
            toast.success("Memo unlinked from task");
        } catch (error) {
            toast.error("Error unlinking memo");
        }
    },

    // Delegation
    delegateTask: async (taskId, newAssigneeId) => {
        try {
            await axiosInstance.patch(`/tasks/${taskId}/delegate`, { assignee: newAssigneeId });
            toast.success("Task delegated");
        } catch (error) {
            toast.error("Error delegating task");
        }
    },

    // Advanced search
    searchTasks: async (query) => {
        set({ isTasksLoading: true });
        try {
            const res = await axiosInstance.get('/tasks/search/advanced', { params: query });
            set({ tasks: res.data });
        } catch (error) {
            toast.error("Error searching tasks");
        } finally {
            set({ isTasksLoading: false });
        }
    },

    // Audit log
    getTaskAuditLog: async (taskId) => {
        try {
            const res = await axiosInstance.get(`/tasks/${taskId}/audit`);
            return res.data;
        } catch (error) {
            toast.error("Error fetching audit log");
            return [];
        }
    },
}));