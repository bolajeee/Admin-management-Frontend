import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useMemoStore = create((set, get) => ({
  memos: [],
  userMemos: [],
  isMemosLoading: false,
  isUserMemosLoading: false,
  memoActionLoading: {},

  setMemoActionLoading: (memoId, isLoading) =>
    set(state => ({ memoActionLoading: { ...state.memoActionLoading, [memoId]: isLoading } })),

  getMemos: async () => {
    set({ isMemosLoading: true });
    try {
      const response = await axiosInstance.get("/memos/all");
      const memos = (response.data.data || []).filter(memo => memo.status !== 'deleted');
      set({ memos });
    } catch (error) {
      set({ memos: [] });
    } finally {
      set({ isMemosLoading: false });
    }
  },

  /**
   * Get memos for a specific user
   * @param {string} userId
   */
  getUserMemos: async (userId) => {
    set({ isUserMemosLoading: true });
    try {
      const response = await axiosInstance.get(`/memos/user/${userId}`);
      const userMemos = (response.data.data || []).filter(memo => memo.status !== 'deleted');
      set({ userMemos });
    } catch (error) {
      set({ userMemos: [] });
    } finally {
      set({ isUserMemosLoading: false });
    }
  },

  /**
   * Send company wide memo
   * @param {Object} memoData
   */
  sendCompanyWideMemo: async (memoData) => {
    set({ isMemosLoading: true });
    if (!memoData.content) {
      console.error("Title and content are required to send a memo");
      set({ isMemosLoading: false });
      return false; // Return false to indicate failure
    }

    try {
      const response = await axiosInstance.post("/memos/broadcast", memoData);
      if (response.status === 201) {
        set((state) => ({
          memos: [response.data.data, ...state.memos]
        }));
      }
      set({ isMemosLoading: false });
    } catch (error) {
      toast.error("Failed to send memo");
      set({ isMemosLoading: false });
    }
  },

  /**
   * Mark memo as read with loading and error handling
   */
  markMemoAsRead: async (memoId, userId) => {
    const { setMemoActionLoading, markMemoAsReadApi, getUserMemos } = get();
    setMemoActionLoading(memoId, true);
    try {
      await markMemoAsReadApi(memoId, userId);
      if (userId) await getUserMemos(userId);
    } finally {
      setMemoActionLoading(memoId, false);
    }
  },

  /**
   * Delete memo for the current user only
   */
  deleteMemo: async (memoId, userId) => {
    const { setMemoActionLoading, getUserMemos } = get();
    setMemoActionLoading(memoId, true);
    try {
      await axiosInstance.delete(`/memos/${memoId}`);
      if (userId) await getUserMemos(userId);
    } catch (e) {
      const errorMessage = e.response?.data?.message || 'Failed to delete memo.';
      toast.error(errorMessage);
    } finally {
      setMemoActionLoading(memoId, false);
    }
  },

  /**
   * Delete memo globally (admin only)
   */
  deleteMemoGlobal: async (memoId, userId) => {
    const { setMemoActionLoading, getMemos, getUserMemos } = get();
    setMemoActionLoading(memoId, true);
    try {
      await axiosInstance.delete(`/memos/${memoId}?global=true`);
      await getMemos();
      if (userId) await getUserMemos(userId);
    } catch (e) {
      toast.error('Failed to delete memo globally');
    } finally {
      setMemoActionLoading(memoId, false);
    }
  },

  markMemoAsReadApi: async (memoId, userId) => {
    try {
      console.log('Store: Marking memo as read:', memoId);
      const response = await axiosInstance.patch(`/memos/${memoId}/read`);
      console.log('Store: Mark as read response:', response.data);
      toast.success('Memo marked as read');
    } catch (e) {
      console.error('Store: Mark as read error:', e.response?.data || e.message);
      toast.error(e.response?.data?.error?.message || 'Failed to mark memo as read');
      throw e;
    }
  },

  /**
   * Acknowledge memo
   */
  acknowledgeMemo: async (memoId, userId, comments = '') => {
    const { setMemoActionLoading, getUserMemos } = get();
    setMemoActionLoading(memoId, true);
    try {
      await axiosInstance.patch(`/memos/${memoId}/acknowledge`, { comments });
      if (userId) await getUserMemos(userId);
      toast.success('Memo acknowledged');
    } catch (e) {
      const errorMessage = e.response?.data?.message || 'Failed to acknowledge memo';
      toast.error(errorMessage);
    } finally {
      setMemoActionLoading(memoId, false);
    }
  },

  /**
   * Snooze memo
   */
  snoozeMemo: async (memoId, userId, durationMinutes = 15, comments = '') => {
    const { setMemoActionLoading, getUserMemos } = get();
    setMemoActionLoading(memoId, true);
    try {
      await axiosInstance.patch(`/memos/${memoId}/snooze`, { durationMinutes, comments });
      if (userId) await getUserMemos(userId);
      toast.success(`Memo snoozed for ${durationMinutes} minutes`);
    } catch (e) {
      const errorMessage = e.response?.data?.message || 'Failed to snooze memo';
      toast.error(errorMessage);
    } finally {
      setMemoActionLoading(memoId, false);
    }
  },



}))