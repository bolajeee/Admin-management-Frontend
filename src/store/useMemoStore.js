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
      let memos = [];
      if (Array.isArray(response.data)) {
        memos = response.data;
      } else if (Array.isArray(response.data.data)) {
        memos = response.data.data;
      }
      // Filter out deleted memos
      memos = memos.filter(memo => memo.status !== 'deleted');
      set({ memos });
      toast.success("Company memos fetched successfully");
    } catch (error) {
      console.error("Error fetching company memos", error);
      toast.error("Error fetching company memos");
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
      let userMemos = [];
      if (Array.isArray(response.data)) {
        userMemos = response.data;
      } else if (Array.isArray(response.data.data)) {
        userMemos = response.data.data;
      }
      // Filter out deleted memos
      userMemos = userMemos.filter(memo => memo.status !== 'deleted');
      set({ userMemos });
      toast.success("User memos fetched successfully");
    } catch (error) {
      console.error("Error fetching user memos", error);
      toast.error("Error fetching user memos");
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
      toast.error("Title and content are required to send a memo");
      set({ isMemosLoading: false });
      return false; // Return false to indicate failure
    }

    try {
      const response = await axiosInstance.post("/memos/broadcast", memoData);
      if (response.status === 201) {
        toast.success("Company wide memo sent successfully");
        set((state) => ({
          memos: [response.data.memo || response.data, ...state.memos]
        }));
      } else {
        toast.error("Failed to send company wide memo");
      }
      set({ isMemosLoading: false });
    } catch (error) {
      console.error("Error sending company wide memo", error);
      toast.error("Error sending company wide memo");
      set({ isMemosLoading: false });
    }
  },

  /**
   * Mark memo as read with loading and error handling
   */
  markMemoAsRead: async (memoId, userId) => {
    const { setMemoActionLoading, markMemoAsRead, getUserMemos } = get();
    setMemoActionLoading(memoId, true);
    try {
      await markMemoAsRead(memoId, userId);
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
      toast.success('Memo deleted for you!');
      if (userId) await getUserMemos(userId);
    } catch (e) {
      toast.error('Failed to delete memo.');
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
      toast.success('Memo deleted globally!');
      await getMemos();
      if (userId) await getUserMemos(userId);
    } catch (e) {
      toast.error('Failed to delete memo globally.');
    } finally {
      setMemoActionLoading(memoId, false);
    }
  },

  markMemoAsRead: async (memoId, userId) => {
    try {
      await axiosInstance.patch(`/memos/${memoId}/read`);
      toast.success('Memo marked as read!');
    } catch (e) {
      toast.error('Failed to mark as read.');
    }
  },



}))