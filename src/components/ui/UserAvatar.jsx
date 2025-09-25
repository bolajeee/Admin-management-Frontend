import React from 'react';

export default function UserAvatar({ user, size = 'w-8 h-8', textSize = 'text-xs', showTooltip = false, onClick, fallback = false, tooltipZIndex = 100 }) {
    if (!user) {
        if (fallback) {
            user = { name: 'Unknown', email: '', role: '' };
        } else {
            return null;
        }
    }
    const initials = (user.name || user.email || 'U')
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    const avatar = user.profilePicture && user.profilePicture.trim() !== ''
        ? <img src={user.profilePicture} alt={user.name || user.email || 'User'} className={`${size} rounded-full border-2 border-primary`} />
        : <div className={`${size} rounded-full border-2 border-primary bg-base-300 flex items-center justify-center ${textSize} font-bold text-primary`}>{user.name ? initials : user.email ? user.email.charAt(0).toUpperCase() : 'U'}</div>;

    // Tooltip content
    const tooltipContent = (
        <div className="p-2 bg-base-100 rounded shadow text-left min-w-[180px]">
            <div className="font-semibold text-base-content">{user.name || user.email}</div>
            <div className="text-xs text-base-content/70">{user.email}</div>
            {user.role && <div className="text-xs text-base-content/60 mt-1">{user.role}</div>}
        </div>
    );

    // Tooltip wrapper (simple, no external lib)
    if (showTooltip) {
        return (
            <span className="relative inline-block align-middle ">
                <span className="group/avatar">
                    {avatar}
                    <span className="pointer-events-none absolute z-50 left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200"
                        style={{ minWidth: 200, zIndex: tooltipZIndex }}>
                        {tooltipContent}
                    </span>
                </span>
            </span>
        );
    }

    // Clickable avatar for sidebar/modal
    if (onClick) {
        return (
            <button type="button" className="focus:outline-none" onClick={e => { e.stopPropagation(); onClick(user); }}>
                {avatar}
            </button>
        );
    }

    // Default: just avatar
    return avatar;
} 