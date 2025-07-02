import React from "react";

export function Card({ children, className = "", ...props }) {
    return (
        <div className={`bg-white rounded-lg shadow p-6 ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = "", ...props }) {
    return (
        <div className={`border-b pb-4 mb-4 ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className = "", ...props }) {
    return (
        <h3 className={`text-lg font-semibold ${className}`} {...props}>
            {children}
        </h3>
    );
}

export function CardContent({ children, className = "", ...props }) {
    return (
        <div className={`mt-2 ${className}`} {...props}>
            {children}
        </div>
    );
}