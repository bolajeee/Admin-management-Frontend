// src/constants/index.js - Enhanced theme system
export const THEMES = [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
    "dim",
    "nord",
    "sunset"
];

// Theme categories for better organization
export const THEME_CATEGORIES = {
    "Popular": ["light", "dark", "cupcake", "corporate", "synthwave", "retro"],
    "Colorful": ["bumblebee", "emerald", "valentine", "halloween", "garden", "aqua"],
    "Dark": ["dark", "synthwave", "halloween", "forest", "black", "luxury", "dracula", "night", "coffee", "dim"],
    "Light": ["light", "cupcake", "emerald", "corporate", "retro", "garden", "lofi", "pastel", "fantasy", "wireframe"],
    "Seasonal": ["valentine", "halloween", "autumn", "winter", "sunset"],
    "Professional": ["corporate", "business", "wireframe", "luxury"],
    "Creative": ["synthwave", "cyberpunk", "fantasy", "acid", "cmyk"]
};

// Map theme names to their respective colors for custom UI elements
export const THEME_COLORS = {
    light: {
        primary: "#4f46e5",
        secondary: "#f97316",
        accent: "#10b981",
        neutral: "#374151",
        background: "#f3f4f6",
        text: "#1f2937"
    },
    dark: {
        primary: "#818cf8",
        secondary: "#fb923c",
        accent: "#34d399",
        neutral: "#9ca3af",
        background: "#1f2937",
        text: "#f9fafb"
    },
    cupcake: {
        primary: "#65c3c8",
        secondary: "#ef9fbc",
        accent: "#eeaf3a",
        neutral: "#291334",
        background: "#faf7f5",
        text: "#291334"
    },
    corporate: {
        primary: "#4b6bfb",
        secondary: "#7b92b2",
        accent: "#67cba0",
        neutral: "#181a2a",
        background: "#ffffff",
        text: "#181a2a"
    },
    synthwave: {
        primary: "#e779c1",
        secondary: "#58c7f3",
        accent: "#f3cc30",
        neutral: "#20134e",
        background: "#1a103d",
        text: "#f7f7f7"
    },
    nord: {
        primary: "#88c0d0",
        secondary: "#81a1c1",
        accent: "#a3be8c",
        neutral: "#e5e9f0",
        background: "#2e3440",
        text: "#eceff4"
    }
};

// Status colors that work across all themes
export const STATUS_COLORS = {
    success: "hsl(var(--su))",
    warning: "hsl(var(--wa))",
    error: "hsl(var(--er))",
    info: "hsl(var(--in))"
};