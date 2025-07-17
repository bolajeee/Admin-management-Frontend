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
            // Normalize _id for all tasks
            set({ tasks: res.data.map(t => ({ ...t, _id: t._id || t.id })) });
        } catch (error) {
            set({ taskError: error });
            toast.error("Error fetching tasks");
        } finally {
            set({ isTasksLoading: false });
        }
    },

    // Fetch present user tasks
    getUserTasks: async (userId) => {
        set({ isUserTasksLoading: true });
        try {
            const res = await axiosInstance.get(`/tasks/userTasks/${userId}`);
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
            const res = await axiosInstance.post('/tasks', taskData);
            // Normalize _id for the new task
            set(state => ({ tasks: [{ ...res.data, _id: res.data._id || res.data.id }, ...state.tasks] }));
            toast.success("Task created");
        } catch (error) {
            toast.error("Error creating task");
        } finally {
            set(state => ({ taskActionLoading: { ...state.taskActionLoading, create: false } }));
        }
    },

    // Update a task
    updateTask: async (taskId, updates) => {
        set(state => ({ taskActionLoading: { ...state.taskActionLoading, [taskId]: true } }));
        try {
            const res = await axiosInstance.patch(`/tasks/${taskId}`, updates);
            // Normalize _id for the updated task
            set(state => ({ tasks: state.tasks.map(t => (t._id === taskId ? { ...res.data, _id: res.data._id || res.data.id } : t)) }));
            toast.success("Task updated");
        } catch (error) {
            toast.error("Error updating task");
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