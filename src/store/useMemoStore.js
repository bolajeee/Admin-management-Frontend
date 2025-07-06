import { create } from "zustand"
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast"

export const useMemoStore = create((set) => ({
    memos: [],
    userMemos: [],
    isMemosLoading: false,
    isUserMemosLoading: false,


    getMemos: async () => {
        set({ isMemosLoading: true });
        try {
            const response = await axiosInstance.get("/memos/all");
            // Ensure memos is always an array
            set({ memos: Array.isArray(response.data) ? response.data : [] });
            toast.success("Company memos fetched successfully");
        } catch (error) {
            console.error("Error fetching company memos", error);
            toast.error("Error fetching company memos");
            set({ memos: [] });
        } finally {
            set({ isMemosLoading: false });
        }
    },

    getUserMemos: async (userId) => {
        set({ isUserMemosLoading: true });
        try {
            const response = await axiosInstance.get(`/memos/user/${userId}`);
            set({ userMemos: response.data });
            toast.success("User memos fetched successfully");
            set({ isUserMemosLoading: false });
        } catch (error) {
            console.error("Error fetching user memos", error);
            toast.error("Error fetching user memos");
            set({ userMemos: [] });
        } finally {
            set({ isUserMemosLoading: false });
        }
    },


    /**
* get user specific Memos
* @params userId - The ID of the user whose memos are to be fetched
*/
    getUserMemos: async (userId) => {
        set({ isUserMemosLoading: true })
        try {
            axiosInstance.post(`/memos/user/${userId}`)
                .then((response) => {
                    set({ userMemos: response.data })
                    toast.success("User memos fetched successfully")
                })
            set({ isUserMemosLoading: false })
        } catch (error) {
            console.error(("Error fetching user memos", error))
            toast.error("Error fetching user memos")
            set({ userMemos: [] })
        } finally {
            set({ isUserMemosLoading: false })
        }
    }
}))