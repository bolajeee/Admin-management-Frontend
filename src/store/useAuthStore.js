import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create(
  persist(
    (set) => ({
      authUser: null,
      isSigningUp: false,
      isLoggingIn: false,
      isUpdatingProfile: false,
      isCheckingAuth: true,
      onlineUsers: [],


      checkAuth: async () => {
        try {
          const res = await axiosInstance.get("/auth/check");
          set({ authUser: res.data });
        } catch (error) {
          console.error("Error in checkAuth:", error);
          set({ authUser: null });
        } finally {
          set({ isCheckingAuth: false });
        }
      },

      signUp: async (formData) => {
        set({ isSigningUp: true });
        try {
          const res = await axiosInstance.post("/auth/signup", formData);
          set({ authUser: res.data });
          toast.success("Signup successful");
        } catch (error) {
          console.error("Error in signUp:", error.response?.data?.message);
          toast.error("Signup failed", error);
        } finally {
          set({ isSigningUp: false });
        }
      },

      logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
          set({ authUser: null });
          toast.success("Logout successful");
        } catch (error) {
          console.error("Error in logout:", error);
          toast.error("Logout failed");
        }
      },

      login: async (formData) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/auth/login", {
            body: formData,
            credentials: "include"
          }

          );
          set({ authUser: res.data });
          toast.success("Login successful");
        } catch (error) {
          console.error("Error in login:", error.response?.data?.message);
          toast.error("Login failed");
        } finally {
          set({ isLoggingIn: false });
        }
      },

      updateProfile: async (formData) => {
        set({ isUpdatingProfile: true });
        try {
          const res = await axiosInstance.put("/auth/updateProfile", formData);
          set({authUser: res.data });
          toast.success("Profile updated successfully");
        } catch (error) {
          console.error("Error in updateProfile:", error?.response?.data?.message || error.message);
          toast.error(error?.response?.data?.message || "Profile update failed");
        } finally {
          set({ isUpdatingProfile: false });
        }
      },
    }),
    {
      name: "auth-storage", // this will persist to localStorage
    }
  )
);
