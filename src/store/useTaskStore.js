import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useTaskStore = create((set) => ({
    userTasks: [],
    isUserTasksLoading: false,


    /**
     * Fetch present user tasks
     * @param userId : The ID of the user whose tasks are to be fetched
     */
    getUserTasks: async (userId) => {
        set({ isUserTasksLoading: true})
        try{
            axiosInstance.post(`/tasks/userTasks/${userId}`)
            .then((res) => {
                set({ tasks: res.data})
                toast.success("User tasks fetched successfully")
            })
        set({ isUserTasksLoading: false })
        }catch(error){
            console.error("Error fetching user tasks", error)
            toast.error("Error fetching user tasks")
            set({ useerTasks: [] })
        }
    },

}))