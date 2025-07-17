import React, { useState, useEffect } from 'react';

export default function TaskModal({
    show,
    onClose,
    onSubmit,
    submitting,
    initialTask = {},
    users = [],
    mode = 'create', // 'create' or 'edit'
}) {
    // Use assignedTo for assignees (array of user IDs)
    const [title, setTitle] = useState(initialTask.title || '');
    const [description, setDescription] = useState(initialTask.description || '');
    const [dueDate, setDueDate] = useState(initialTask.dueDate ? initialTask.dueDate.slice(0, 10) : '');
    const [priority, setPriority] = useState(initialTask.priority || 'medium');
    // Always control status from initialTask.status
    const [status, setStatus] = useState(initialTask.status || 'todo');
    const [category, setCategory] = useState(initialTask.category || '');
    const [assignedTo, setAssignedTo] = useState(initialTask.assignedTo || []);
    const [recurrence, setRecurrence] = useState(initialTask.recurrence?.frequency || 'none');
    const [expandedUser, setExpandedUser] = useState(null); // For expanding user info

    useEffect(() => {
        if (show) {
            setTitle(initialTask.title || '');
            setDescription(initialTask.description || '');
            setDueDate(initialTask.dueDate ? initialTask.dueDate.slice(0, 10) : '');
            setPriority(initialTask.priority || 'medium');
            setStatus(initialTask.status || 'todo'); // Always reset status from initialTask
            setCategory(initialTask.category || '');
            setAssignedTo(initialTask.assignedTo || []);
            setRecurrence(initialTask.recurrence?.frequency || 'none');
            setExpandedUser(null);
        }
    }, [show, initialTask]);

    if (!show) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            title,
            description,
            dueDate: dueDate ? new Date(dueDate) : null,
            priority,
            status, // Ensure status is always submitted
            category,
            assignedTo, // Use assignedTo for backend compatibility
            recurrence: { frequency: recurrence },
        });
    };

    const handleAssigneeChange = (e) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setAssignedTo(value);
    };

    // Helper to get user object by ID
    const getUserById = (id) => users.find(u => u._id === id);

    // Helper for avatar/initials
    const renderAvatar = (user, size = 'w-8 h-8', textSize = 'text-base') => {
        if (user?.profilePicture && user.profilePicture.trim() !== "") {
            return <img src={user.profilePicture} alt={user.name || user.email || 'User'} className={`${size} rounded-full border-2 border-primary`} />;
        } else {
            const initials = (user?.name || user?.email || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            return <div className={`${size} rounded-full border-2 border-primary bg-base-300 flex items-center justify-center ${textSize} font-bold text-primary`}>{initials}</div>;
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <form onSubmit={handleSubmit} className="bg-base-100 p-0 rounded-xl shadow-lg w-[95vw] max-w-3xl flex flex-col md:flex-row gap-0 overflow-hidden">
                {/* Left: Form */}
                <div className="flex-1 p-6 flex flex-col gap-4 min-w-[300px]">
                    <h2 className="text-2xl font-bold mb-2 text-primary">{mode === 'edit' ? 'Edit Task' : 'Create Task'}</h2>
                    {/* Section: Title & Description */}
                    <div className="space-y-2">
                        <label className="font-medium">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Task title..."
                            className="w-full p-3 border rounded-md bg-base-200 text-base-content focus:ring-2 focus:ring-primary/30"
                            required
                        />
                        <label className="font-medium">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Task description..."
                            rows={3}
                            className="w-full p-3 border rounded-md resize-none bg-base-200 text-base-content focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    {/* Section: Dates & Priority */}
                    <div className="flex gap-2">
                        <div className="flex-1 flex flex-col">
                            <label className="font-medium">Due Date</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="input input-bordered"
                            />
                        </div>
                        <div className="flex-1 flex flex-col">
                            <label className="font-medium">Priority</label>
                            <select
                                className="select select-bordered"
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div className="flex-1 flex flex-col">
                            <label className="font-medium">Status</label>
                            <select
                                className="select select-bordered"
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                            >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="blocked">Blocked</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    {/* Section: Category & Recurrence */}
                    <div className="flex gap-2">
                        <div className="flex-1 flex flex-col">
                            <label className="font-medium">Category</label>
                            <input
                                type="text"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                placeholder="Category (optional)"
                                className="input input-bordered"
                            />
                        </div>
                        <div className="flex-1 flex flex-col">
                            <label className="font-medium">Recurrence</label>
                            <select
                                className="select select-bordered"
                                value={recurrence}
                                onChange={e => setRecurrence(e.target.value)}
                            >
                                <option value="none">None</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                    </div>
                    {/* Section: Assignees */}
                    <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center justify-between">
                            <label className="font-medium">Assignees</label>
                            <button
                                type="button"
                                className="btn btn-xs btn-secondary"
                                onClick={() => users.length && setAssignedTo(users.map(u => u._id))}
                            >
                                Select All
                            </button>
                        </div>
                        {/* Custom checkbox list for assignees */}
                        <div className="flex flex-col gap-1 max-h-32 overflow-y-auto bg-base-100 rounded p-2 border border-base-300">
                            {users.map(user => (
                                <label key={user._id} className="flex items-center gap-2 cursor-pointer hover:bg-base-200 rounded px-2 py-1">
                                    <input
                                        type="checkbox"
                                        checked={assignedTo.includes(user._id)}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                setAssignedTo(prev => [...prev, user._id]);
                                            } else {
                                                setAssignedTo(prev => prev.filter(id => id !== user._id));
                                            }
                                        }}
                                        className="checkbox checkbox-sm"
                                    />
                                    {renderAvatar(user, 'w-6 h-6', 'text-xs')}
                                    <span className="text-sm">{user.name || user.email}</span>
                                </label>
                            ))}
                        </div>
                        <div className="text-xs text-base-content/60 mt-1">You can select multiple users by clicking the checkboxes above.</div>
                    </div>
                    {/* Note about attachments and comments */}
                    <div className="w-full text-xs text-base-content/60 mt-2 mb-2 text-right">
                        You can add attachments and comments after creating the task.
                    </div>
                    {/* Action buttons */}
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-md border border-base-300 bg-base-300 text-base-content text-sm font-medium transition-colors hover:bg-base-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || title.trim() === ''}
                            className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                            {submitting ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save Changes' : 'Create Task')}
                        </button>
                    </div>
                </div>
                {/* Right: Assigned Users List */}
                <div className="w-full md:w-64 bg-base-200 border-l border-base-300 p-4 flex flex-col gap-2 min-h-full">
                    <div className="font-semibold text-base mb-2">Assigned Users</div>
                    {assignedTo.length === 0 ? (
                        <div className="text-xs text-base-content/60">No users assigned yet.</div>
                    ) : (
                        <ul className="space-y-2">
                            {assignedTo.map(uid => {
                                const user = getUserById(uid);
                                if (!user) return null;
                                return (
                                    <li key={uid} className="flex items-center gap-2 bg-base-100 rounded-lg p-2 shadow-sm">
                                        {renderAvatar(user, 'w-8 h-8', 'text-base')}
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{user.name || user.email}</div>
                                            <button
                                                type="button"
                                                className="text-xs text-primary underline hover:text-primary/80"
                                                onClick={() => setExpandedUser(expandedUser === uid ? null : uid)}
                                            >
                                                {expandedUser === uid ? 'Hide Info' : 'Show Info'}
                                            </button>
                                            {expandedUser === uid && (
                                                <div className="mt-1 text-xs bg-base-300 rounded p-2">
                                                    <div><span className="font-semibold">Email:</span> {user.email}</div>
                                                    <div><span className="font-semibold">Role:</span> {user.role || 'N/A'}</div>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </form>
        </div>
    );
} 