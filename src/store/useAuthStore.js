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
      isDeletingUser: false,
      onlineUsers: [],


      checkAuth: async () => {
        // Don't check auth if we're already on the login page
        if (window.location.pathname === '/login') {
          set({ isCheckingAuth: false });
          return;
        }
        
        try {
          const res = await axiosInstance.get("/auth/check");
          const user = res.data.data;

          set({ 
            authUser: user,
            isCheckingAuth: false 
          });
        } catch (error) {
          set({ 
            authUser: null,
            isCheckingAuth: false 
          });
        }
      },

      signUp: async (formData) => {
        set({ isSigningUp: true });
        try {
          const res = await axiosInstance.post("/auth/signup", formData);
          const user = res.data.data;
          set({ authUser: user });
          toast.success("Signup successful");
        } catch (error) {
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
          toast.error("Logout failed");
        }
      },

      login: async (formData) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/auth/login", formData, {
            withCredentials: true,
          });

          const { user, token } = res.data.data;

          set({ authUser: user });
          localStorage.setItem("token", token);
          toast.success("Login successful");
          return true;
        } catch (error) {
          const message =
            error.response?.data?.message || "Invalid credentials or server error.";
          toast.error(message);
          return false;
        } finally {
          set({ isLoggingIn: false });
        }
      },

      updateProfile: async (formData) => {
        set({ isUpdatingProfile: true });
        try {
          const res = await axiosInstance.put("/auth/updateProfile", formData);
          const user = res.data.data;
          set({ authUser: user });
          toast.success("Profile updated successfully");
        } catch (error) {
          toast.error(error?.response?.data?.message || "Profile update failed");
        } finally {
          set({ isUpdatingProfile: false });
        }
      },

      changePassword: async ({ currentPassword, newPassword }) => {
        try {
          const res = await axiosInstance.post("/auth/changePassword", {
            currentPassword,
            newPassword,
          });
          toast.success(res.data?.message || "Password changed successfully");
          return true;
        } catch (error) {
          const message = error.response?.data?.message || "Failed to change password.";
          toast.error(message);
          return false;
        }
      },

      deleteUser: async (userId) => {
        set({ isDeletingUser: true });
        try {
          await axiosInstance.delete(`/auth/deleteUser/${userId}`);
          set((state) => ({
            authUser: state.authUser?._id === userId ? null : state.authUser,
          }));
          toast.success("User deleted successfully");
        } catch (error) {
          toast.error("Failed to delete user");
          set({ isDeletingUser: false });
        }
      },
    }),
    {
      name: "auth-storage", // this will persist to localStorage
      partialize: (state) => ({
        authUser: state.authUser,
      }),
    }
  )
);
