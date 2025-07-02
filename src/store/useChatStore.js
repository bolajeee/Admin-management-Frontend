import { create } from "zustand"
import toast from "react-hot-toast"
import { axiosInstance } from "../lib/axios"

export const useChatStore = create((set) => ({
    messages: [],
    users: [],
    memos: [],
    userMemos: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isMemosLoading: false,
    isUserMemosLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const response = await axiosInstance.get("/messages/users");
            set({ users: response.data });
            toast.success("Users fetched successfully");
        } catch (error) {
            console.error("Error fetching users", error);
            toast.error("Error fetching users");
            set({ users: [] });
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true })
        try {
            const response = await axiosInstance.get(`/messages/${userId}`)
            set({ messages: response.data.messages })
            toast.success("Messages fetched successfully")
        } catch (error) {
            console.error("Error fetching messages", error)
            toast.error("Error fetching messages")
        } finally {
            set({ isMessagesLoading: false })
        }
    },

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
        } catch (error) {
            console.error("Error fetching user memos", error);
            toast.error("Error fetching user memos");
            set({ userMemos: [] });
        } finally {
            set({ isUserMemosLoading: false });
        }
    },

    setSelectedUser:
        (selectedUser) => {
            set({ selectedUser })
        }

}))