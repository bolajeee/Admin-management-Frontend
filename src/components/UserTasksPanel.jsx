import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useTaskStore } from '../store/useTaskStore';
import { ScrollText, Loader2, CheckCircle, Clock, Trash2, XCircle } from 'lucide-react';

function formatDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
}

export default function UserTasksPanel() {
  const { getUserTasks, userTasks, isUserTasksLoading, markTaskAsComplete, deleteTask, taskActionLoading } = useTaskStore();
  const { authUser } = useAuthStore();
  const userId = authUser?._id;

  useEffect(() => {
    if (userId) getUserTasks(userId);
  }, [userId, getUserTasks]);

  // Filter out deleted tasks
  const filteredTasks = (userTasks || []).filter(task => task.status !== 'deleted');

  const getTaskStatusProps = (task) => {
    switch (task.status) {
      case 'completed':
        return {
          border: 'border-green-400',
          bg: 'bg-green-50',
          icon: <CheckCircle className="text-green-500 w-4 h-4" />,
          label: 'Completed',
          text: 'text-green-700',
          faded: false,
        };
      case 'deleted':
        return {
          border: 'border-red-400',
          bg: 'bg-red-50 opacity-60',
          icon: <Trash2 className="text-red-500 w-4 h-4" />,
          label: 'Deleted',
          text: 'text-red-700',
          faded: true,
        };
      case 'pending':
      default:
        return {
          border: 'border-yellow-400',
          bg: 'bg-yellow-50',
          icon: <Clock className="text-yellow-500 w-4 h-4" />,
          label: 'Pending',
          text: 'text-yellow-700',
          faded: false,
        };
    }
  };

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
      ) : filteredTasks.length === 0 ? (
        <p className="text-sm text-gray-500">No tasks for this user.</p>
      ) : (
        <ul className="space-y-3">
          {filteredTasks.map((task) => {
            const statusProps = getTaskStatusProps(task);
            const isCompleted = task.status === 'completed';
            const isDeleted = task.status === 'deleted';
            
            return (
              <li key={task._id} className={`p-3 rounded-lg border shadow-sm flex flex-col gap-1 ${statusProps.bg} ${statusProps.border} ${statusProps.faded ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  {statusProps.icon}
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${statusProps.text} ${statusProps.border} bg-white/70`}>
                    {statusProps.label}
                  </span>
                  <span className="text-xs text-base-content/60">{formatDate(task.createdAt)}</span>
                  
                  {!isCompleted && !isDeleted && (
                    <button
                      className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 transition disabled:opacity-50"
                      onClick={() => markTaskAsComplete(task._id, userId)}
                      disabled={taskActionLoading[task._id]}
                    >
                      {taskActionLoading[task._id] ? '...' : 'Mark Complete'}
                    </button>
                  )}
                  
                  {!isDeleted && (
                    <button
                      className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/20 hover:bg-error/20 transition disabled:opacity-50"
                      onClick={() => deleteTask(task._id, userId)}
                      disabled={taskActionLoading[task._id]}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className={`font-semibold text-base-content text-lg ${statusProps.text}`}>{task.title || 'Untitled Task'}</div>
                <div className={`text-sm text-base-content/80 mb-1 ${statusProps.text}`}>{task.description || task.text}</div>
                {task.dueDate && (
                  <div className="text-xs text-gray-500 mt-1">
                    Due: {formatDate(task.dueDate)}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
