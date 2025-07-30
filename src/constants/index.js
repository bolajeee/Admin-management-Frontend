// src/constants/index.js - Fix the duplicate card component code
export const THEMES = [
    "light",
    "dark",
    "nord",
];

// Map theme names to their respective colors for custom UI elements
export const THEME_COLORS = {
    light: {
        primary: "#4f46e5", // Indigo
        secondary: "#f97316", // Orange
        accent: "#10b981", // Emerald
        neutral: "#374151", // Gray
        background: "#f3f4f6", // Gray-100
        text: "#1f2937" // Gray-800
    },
    dark: {
        primary: "#818cf8", // Indigo
        secondary: "#fb923c", // Orange
        accent: "#34d399", // Emerald
        neutral: "#9ca3af", // Gray
        background: "#1f2937", // Gray-800
        text: "#f9fafb" // Gray-50
    },
    nord: {
        primary: "#88c0d0", // Nord
        secondary: "#81a1c1", // Nord
        accent: "#a3be8c", // Nord
        neutral: "#e5e9f0", // Nord
        background: "#2e3440", // Nord
        text: "#eceff4" // Nord
    }
};