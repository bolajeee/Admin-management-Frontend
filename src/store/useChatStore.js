import { create } from "zustand"
import toast from "react-hot-toast"
import { axiosInstance } from "../lib/axios"
import { useAuthStore } from "./useAuthStore"

export const useChatStore = create((set) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSendingMessage: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const response = await axiosInstance.get("/messages/users");
            const users = response.data.data || [];
            set({ users });
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
            const response = await axiosInstance.get(`/messages/userMessage/${userId}`)
            set({ messages: response.data.data.messages || [] })
            toast.success("Messages fetched successfully")

        } catch (error) {
            console.error("Error fetching messages", error)
            toast.error("Error fetching messages")
        } finally {
            set({ isMessagesLoading: false })
        }
    },

    
    /**
     * Send a message (text and/or image) to a user.
     * @param {Object} params
     * @param {string} params.receiverId - The user ID to send the message to
     * @param {string} [params.text] - The text content of the message
     * @param {File} [params.image] - The image file to send (optional)
     */
    sendMessage: async ({ receiverId, text, image }) => {
        set({ isSendingMessage: true });
        try {
            const formData = new FormData();
            formData.append("text", text || "");
            if (image) formData.append("image", image);

            const response = await axiosInstance.post(
                `/messages/user/${receiverId}`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const newMessage = response.data.data.message;

            set((state) => ({ messages: [...state.messages, newMessage] }));
            toast.success("Message sent successfully");
        } catch (error) {
            console.error("Error sending message", error);
            toast.error("Error sending message");
        } finally {
            set({ isSendingMessage: false });
        }
    },


    setSelectedUser:
        (selectedUser) => {
            set({ selectedUser })
        },


}))