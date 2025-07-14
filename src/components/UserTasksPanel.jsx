import React, { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useTaskStore } from '../store/useTaskStore';
import { ScrollText, Loader2 } from 'lucide-react';

export default function UserMemosPanel() {
    const { getUserTasks, userTasks, isUserTasksLoading } = useTaskStore();
    const { authUser } = useAuthStore();
    const userId = authUser?._id;


    useEffect(() => {
        if (userId) getUserTasks(userId);
    }, [userId]);

    return (
        <div className="p-4 bg-base-100 dark:bg-base-200 flex-1 overflow-y-auto w-full max-w-md md:max-w-lg">
            <div className="flex items-center gap-2 mb-4 text-primary font-semibold">
                <ScrollText className="w-5 h-5" />
                <h2 className="text-lg">Tasks</h2>
            </div>
            {isUserTasksLoading ? (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                </div>
            ) : userTasks?.length === 0 ? (
                <p className="text-sm text-gray-500">No Tasks for this user.</p>
            ) : (
                <ul className="space-y-3">
                    {userTasks?.map((task) => (
                        <li key={task._id} className="p-2 rounded-lg bg-base-200 dark:bg-base-300">
                            <p className="text-sm text-base-content">{task.text}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(task.createdAt).toLocaleDateString()}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
