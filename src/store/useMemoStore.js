import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useMemoStore = create((set) => ({
  memos: [],
  userMemos: [],
  isMemosLoading: false,
  isUserMemosLoading: false,

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

}))