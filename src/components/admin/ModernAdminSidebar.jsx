import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  CheckSquare,
  BarChart2,
  ChevronRight,
  ChevronDown,
  Home,
  Activity,
  Zap,
  Shield,
  Database,
  FileText,
  Calendar,
  Search
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const ModernAdminSidebar = ({ isCollapsed, onToggleCollapse }) => {
  const { logout } = useAuthStore();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState(['main', 'management']);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const navigationSections = [
    {
      id: 'main',
      title: 'Overview',
      icon: <Home className="h-4 w-4" />,
      items: [
        { 
          name: 'Dashboard', 
          path: '/admin', 
          icon: <LayoutDashboard className="h-5 w-5" />, 
          description: 'Analytics & Overview',
          badge: null
        },
        { 
          name: 'Quick Actions', 
          path: '/admin/quick-actions', 
          icon: <Zap className="h-5 w-5" />, 
          description: 'Fast Operations',
          badge: 'New'
        }
      ]
    },
    {
      id: 'management',
      title: 'Management',
      icon: <Shield className="h-4 w-4" />,
      items: [
        { 
          name: 'Employees', 
          path: '/admin/employees', 
          icon: <Users className="h-5 w-5" />, 
          description: 'User Management',
          badge: null
        },
        { 
          name: 'Messages', 
          path: '/admin/messages', 
          icon: <MessageSquare className="h-5 w-5" />, 
          description: 'Communication Hub',
          badge: '3'
        },
        { 
          name: 'Memos', 
          path: '/admin/memos', 
          icon: <Bell className="h-5 w-5" />, 
          description: 'Announcements',
          badge: null
        },
        { 
          name: 'Tasks', 
          path: '/admin/tasks', 
          icon: <CheckSquare className="h-5 w-5" />, 
          description: 'Task Management',
          badge: '12'
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      icon: <BarChart2 className="h-4 w-4" />,
      items: [
        { 
          name: 'Reports', 
          path: '/admin/reports', 
          icon: <FileText className="h-5 w-5" />, 
          description: 'Data & Insights',
          badge: null
        },
        { 
          name: 'Performance', 
          path: '/admin/performance', 
          icon: <Activity className="h-5 w-5" />, 
          description: 'System Metrics',
          badge: null
        }
      ]
    },
    {
      id: 'system',
      title: 'System',
      icon: <Database className="h-4 w-4" />,
      items: [
        { 
          name: 'Settings', 
          path: '/admin/settings', 
          icon: <Settings className="h-5 w-5" />, 
          description: 'Configuration',
          badge: null
        }
      ]
    }
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-full bg-gradient-to-b from-base-200 to-base-300 border-r border-base-300 shadow-xl flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-base-300/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-content" />
              </div>
              <div>
                <h2 className="font-bold text-base-content">Admin Panel</h2>
                <p className="text-xs text-base-content/60">Management Console</p>
              </div>
            </motion.div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <Shield className="h-5 w-5 text-primary-content" />
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-base-100 border border-base-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-2">
        <div className="space-y-2">
          {navigationSections.map((section) => (
            <div key={section.id} className="space-y-1">
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-base-content/60 uppercase tracking-wider hover:text-base-content transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    {section.icon}
                    <span>{section.title}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedSections.includes(section.id) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </motion.div>
                </button>
              )}
              
              <AnimatePresence>
                {(isCollapsed || expandedSections.includes(section.id)) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1"
                  >
                    {section.items.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 relative ${
                          location.pathname === item.path
                            ? 'bg-primary text-primary-content shadow-lg scale-[1.02]'
                            : 'text-base-content hover:bg-base-100 hover:text-primary hover:scale-[1.01]'
                        }`}
                      >
                        <span className={`mr-3 group-hover:scale-110 transition-transform ${isCollapsed ? 'mr-0' : ''}`}>
                          {item.icon}
                        </span>
                        
                        {!isCollapsed && (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium truncate">{item.name}</div>
                                <div className="text-xs opacity-70 truncate">{item.description}</div>
                              </div>
                              {item.badge && (
                                <span className={`ml-2 px-2 py-1 text-xs rounded-full font-medium ${
                                  item.badge === 'New' 
                                    ? 'bg-success text-success-content' 
                                    : 'bg-warning text-warning-content'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {location.pathname === item.path && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute right-2"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </motion.div>
                        )}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-base-300/50 p-4">
        <button
          onClick={logout}
          className={`flex items-center w-full rounded-lg px-3 py-3 text-sm font-medium text-error transition-all duration-200 hover:bg-error/10 hover:scale-[1.02] group ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className={`h-5 w-5 group-hover:rotate-12 transition-transform ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
          {!isCollapsed && (
            <div>
              <div className="font-medium">Logout</div>
              <div className="text-xs opacity-60">Sign out safely</div>
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ModernAdminSidebar;