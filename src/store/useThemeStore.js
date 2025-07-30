// src/store/useThemeStore.js
import { create } from "zustand";
import { THEMES } from "../constants";

export const useThemeStore = create((set, get) => ({
    // Get theme from localStorage or fall back to "light" and ensure it's a valid theme
    theme: (() => {
        const savedTheme = localStorage.getItem("chat-theme");
        return THEMES.includes(savedTheme) ? savedTheme : "light";
    })(),
    
    setTheme: (theme) => {
        if (THEMES.includes(theme)) {
            localStorage.setItem("chat-theme", theme);
            
            // Update HTML data-theme attribute for DaisyUI
            document.documentElement.setAttribute("data-theme", theme);
            
            set({ theme });
        }
    },
    
    // Initialize theme when app loads
    initializeTheme: () => {
        const { theme } = get();
        document.documentElement.setAttribute("data-theme", theme);
    }
}));