import React from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  MessageSquare,
  Bell,
  CheckSquare,
  FileText,
  Settings,
  BarChart3,
  Users,
  Calendar,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

const QuickActionsPanel = ({ onAction }) => {
  const quickActions = [
    {
      id: 'add-user',
      title: 'Add Employee',
      description: 'Create new user account',
      icon: UserPlus,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      shortcut: 'Ctrl+N'
    },
    {
      id: 'send-memo',
      title: 'Send Memo',
      description: 'Broadcast announcement',
      icon: Bell,
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      shortcut: 'Ctrl+M'
    },
    {
      id: 'create-task',
      title: 'Create Task',
      description: 'Assign new task',
      icon: CheckSquare,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      shortcut: 'Ctrl+T'
    },
    {
      id: 'view-messages',
      title: 'Messages',
      description: 'Check conversations',
      icon: MessageSquare,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      badge: '3'
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create analytics report',
      icon: BarChart3,
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600'
    },
    {
      id: 'manage-users',
      title: 'Manage Users',
      description: 'User administration',
      icon: Users,
      color: 'bg-teal-500',
      hoverColor: 'hover:bg-teal-600'
    },
    {
      id: 'schedule-meeting',
      title: 'Schedule Meeting',
      description: 'Plan team meeting',
      icon: Calendar,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600'
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download reports',
      icon: Download,
      color: 'bg-gray-500',
      hoverColor: 'hover:bg-gray-600'
    }
  ];

  const handleActionClick = (actionId) => {
    if (onAction) {
      onAction(actionId);
    }
  };

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-base-content">Quick Actions</h2>
          <p className="text-sm text-base-content/60 mt-1">
            Frequently used admin operations
          </p>
        </div>
        <button className="btn btn-ghost btn-sm">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;
          
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleActionClick(action.id)}
              className="relative group p-4 bg-base-200 hover:bg-base-300 rounded-lg transition-all duration-200 text-left border border-transparent hover:border-primary/20"
            >
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-lg ${action.color} ${action.hoverColor} text-white mb-3 group-hover:scale-110 transition-transform`}>
                <IconComponent className="h-5 w-5" />
              </div>

              {/* Badge */}
              {action.badge && (
                <div className="absolute top-2 right-2">
                  <span className="badge badge-error badge-sm">{action.badge}</span>
                </div>
              )}

              {/* Content */}
              <div>
                <h3 className="font-medium text-base-content group-hover:text-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-base-content/60 mt-1">
                  {action.description}
                </p>
                
                {/* Shortcut */}
                {action.shortcut && (
                  <div className="mt-2">
                    <span className="text-xs bg-base-300 px-2 py-1 rounded text-base-content/50">
                      {action.shortcut}
                    </span>
                  </div>
                )}
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
            </motion.button>
          );
        })}
      </div>

      {/* Recent Actions */}
      <div className="mt-6 pt-6 border-t border-base-300">
        <h3 className="text-sm font-medium text-base-content/80 mb-3">Recent Actions</h3>
        <div className="space-y-2">
          {[
            { action: 'Created task "Update documentation"', time: '2 minutes ago' },
            { action: 'Added user "John Smith"', time: '15 minutes ago' },
            { action: 'Sent memo "Team Meeting"', time: '1 hour ago' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-base-content/70">{item.action}</span>
              <span className="text-base-content/50">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;