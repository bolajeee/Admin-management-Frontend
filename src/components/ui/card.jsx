import React from "react";
import { useThemeStore } from '../../store/useThemeStore';

export function Card({ children, className = "", ...props }) {
    const { theme } = useThemeStore();
    
    // Use DaisyUI theme variables instead of hardcoded colors
    return (
        <div 
            className={`rounded-lg shadow p-6 bg-base-100 ${className}`} 
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = "", ...props }) {
    return (
        <div className={`border-b pb-4 mb-4 border-base-300 ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className = "", ...props }) {
    return (
        <h3 className={`text-lg font-semibold text-base-content ${className}`} {...props}>
            {children}
        </h3>
    );
}

export function CardContent({ children, className = "", ...props }) {
    return (
        <div className={`mt-2 text-base-content ${className}`} {...props}>
            {children}
        </div>
    );
}