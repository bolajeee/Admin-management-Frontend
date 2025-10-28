import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  Check,
  AlertTriangle,
  Info,
  MessageSquare,
  CheckSquare,
  Users,
  Settings,
  Clock,
  Filter,
  MoreVertical
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { axiosInstance } from '../../lib/axios';
import toast from 'react-hot-toast';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const { authUser } = useAuthStore();

  // Fetch real notifications from backend
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // For now, create notifications from recent activities
      const [tasksRes, memosRes, messagesRes] = await Promise.all([
        axiosInstance.get('/tasks').catch(() => ({ data: { tasks: [] } })),
        axiosInstance.get('/memos/user').catch(() => ({ data: { memos: [] } })),
        axiosInstance.get('/messages/recent').catch(() => ({ data: { data: { messages: [] } } }))
      ]);

      const tasks = tasksRes.data.tasks || [];
      const memos = memosRes.data.memos || [];
      const messages = messagesRes.data.data?.messages || [];

      const taskNotifications = tasks.slice(0, 3).map(task => ({
        id: `task-${task._id}`,
        type: 'task',
        title: 'Task Update',
        message: `Task "${task.title}" status: ${task.status}`,
        timestamp: new Date(task.updatedAt || task.createdAt),
        read: false,
        priority: task.priority,
        actionUrl: `/admin/tasks`
      }));

      const memoNotifications = memos.slice(0, 2).map(memo => ({
        id: `memo-${memo._id}`,
        type: 'memo',
        title: 'New Memo',
        message: memo.title,
        timestamp: new Date(memo.createdAt),
        read: memo.readBy?.some(r => r.user === authUser._id) || false,
        priority: memo.severity,
        actionUrl: `/admin/memos`
      }));

      const messageNotifications = messages.slice(0, 2).map(msg => ({
        id: `message-${msg._id}`,
        type: 'message',
        title: 'New Message',
        message: `Message from ${msg.sender?.name || 'User'}`,
        timestamp: new Date(msg.createdAt),
        read: !!msg.readAt,
        priority: 'medium',
        actionUrl: `/admin/messages`
      }));

      setNotifications([...taskNotifications, ...memoNotifications, ...messageNotifications]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      task: CheckSquare,
      memo: Bell,
      message: MessageSquare,
      system: Settings,
      user: Users
    };
    return icons[type] || Info;
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'text-error';
    if (priority === 'medium') return 'text-warning';
    
    const colors = {
      task: 'text-primary',
      memo: 'text-info',
      message: 'text-success',
      system: 'text-secondary',
      user: 'text-accent'
    };
    return colors[type] || 'text-base-content';
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed right-4 top-20 w-96 max-h-[80vh] bg-base-100 rounded-lg shadow-2xl border border-base-300 z-50"
        >
          {/* Header */}
          <div className="p-4 border-b border-base-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-base-content">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="badge badge-primary badge-sm">{unreadCount}</span>
                )}
              </div>
              <button
                onClick={onClose}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mt-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="select select-sm select-bordered flex-1"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="task">Tasks</option>
                <option value="memo">Memos</option>
                <option value="message">Messages</option>
                <option value="system">System</option>
                <option value="user">Users</option>
              </select>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="btn btn-ghost btn-sm"
                  title="Mark all as read"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-base-300 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-base-300 rounded w-3/4"></div>
                        <div className="h-3 bg-base-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-base-content/30 mx-auto mb-3" />
                <p className="text-base-content/60">No notifications found</p>
              </div>
            ) : (
              <div className="divide-y divide-base-300">
                <AnimatePresence>
                  {filteredNotifications.map((notification, index) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    const iconColor = getNotificationColor(notification.type, notification.priority);
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 hover:bg-base-200 transition-colors ${
                          !notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-base-200 ${iconColor}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className={`text-sm font-medium ${
                                  !notification.read ? 'text-base-content' : 'text-base-content/80'
                                }`}>
                                  {notification.title}
                                </h4>
                                <p className="text-xs text-base-content/60 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock className="h-3 w-3 text-base-content/40" />
                                  <span className="text-xs text-base-content/40">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                  {notification.priority === 'high' && (
                                    <span className="badge badge-error badge-xs">High</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="dropdown dropdown-end">
                                <button
                                  tabIndex={0}
                                  className="btn btn-ghost btn-xs btn-circle"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </button>
                                <ul
                                  tabIndex={0}
                                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40"
                                >
                                  {!notification.read && (
                                    <li>
                                      <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-xs"
                                      >
                                        Mark as read
                                      </button>
                                    </li>
                                  )}
                                  <li>
                                    <button
                                      onClick={() => deleteNotification(notification.id)}
                                      className="text-xs text-error"
                                    >
                                      Delete
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </div>
                            
                            {notification.actionUrl && (
                              <button
                                onClick={() => {
                                  // Navigate to action URL
                                  markAsRead(notification.id);
                                  onClose();
                                }}
                                className="btn btn-xs btn-primary mt-2"
                              >
                                View Details
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-base-300 bg-base-50">
              <button className="btn btn-ghost btn-sm w-full">
                View All Notifications
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter;