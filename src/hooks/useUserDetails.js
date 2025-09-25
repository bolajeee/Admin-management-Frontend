import { useState } from 'react';
import { toast } from 'react-hot-toast';

export function useUserDetails(users) {
    const [search, setSearch] = useState('');
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [detailsUser, setDetailsUser] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [userStats, setUserStats] = useState({ messages: 0, joined: '', lastMessage: '' });

    // Filter users by search
    const filteredUsers = users.filter(user =>
        (user.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(search.toLowerCase())
    );

    // Fetch user stats for details modal
    const openUserDetails = async (user) => {
        setDetailsUser(user);
        setDetailsModalOpen(true);
        setDetailsLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${user._id}/stats`);
            const data = await res.json();
            setUserStats({
                messages: data.totalMessages || 0,
                joined: data.joined || user.createdAt || '',
                lastMessage: data.lastMessage || '',
            });
        } catch {
            setUserStats({ messages: 0, joined: user.createdAt || '', lastMessage: '' });
        } finally {
            setDetailsLoading(false);
        }
    };

    // Admin actions
    const handleToggleActive = async () => {
        if (!detailsUser) return;
        try {
            setDetailsLoading(true);
            await fetch(`/api/admin/users/${detailsUser._id}/toggle-active`, { method: 'PATCH' });
            toast.success(`User ${detailsUser.isActive ? 'deactivated' : 'activated'}!`);
            setDetailsUser({ ...detailsUser, isActive: !detailsUser.isActive });
        } catch {
            toast.error('Failed to update user status.');
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!detailsUser) return;
        try {
            setDetailsLoading(true);
            await fetch(`/api/admin/users/${detailsUser._id}/reset-password`, { method: 'POST' });
            toast.success('Password reset email sent!');
        } catch {
            toast.error('Failed to reset password.');
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!detailsUser) return;
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            setDetailsLoading(true);
            await fetch(`/api/users/${detailsUser._id}`, { method: 'DELETE' });
            toast.success('User deleted!');
            setDetailsModalOpen(false);
        } catch {
            toast.error('Failed to delete user.');
        } finally {
            setDetailsLoading(false);
        }
    };

    return {
        search,
        setSearch,
        detailsModalOpen,
        setDetailsModalOpen,
        detailsUser,
        setDetailsUser,
        detailsLoading,
        userStats,
        filteredUsers,
        openUserDetails,
        handleToggleActive,
        handleResetPassword,
        handleDeleteUser,
    };
}
