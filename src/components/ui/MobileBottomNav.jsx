import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Bell,
  CheckSquare,
  MoreHorizontal
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const MobileBottomNav = () => {
  const location = useLocation();
  const { authUser } = useAuthStore();
  const isAdmin = authUser?.role === 'admin';
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Only show on admin routes for mobile
  if (!isAdminRoute || !isAdmin) return null;

  const navItems = [
    {
      path: '/admin',
      icon: LayoutDashboard,
      label: 'Dashboard',
      exact: true
    },
    {
      path: '/admin/employees',
      icon: Users,
      label: 'Users'
    },
    {
      path: '/admin/messages',
      icon: MessageSquare,
      label: 'Messages',
      badge: 3
    },
    {
      path: '/admin/memos',
      icon: Bell,
      label: 'Memos'
    },
    {
      path: '/admin/tasks',
      icon: CheckSquare,
      label: 'Tasks',
      badge: 5
    }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-base-100 border-t border-base-300 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path, item.exact);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center p-2 min-w-0 flex-1"
            >
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                />
              )}
              
              {/* Icon with badge */}
              <div className="relative">
                <IconComponent 
                  className={`h-5 w-5 transition-colors ${
                    active ? 'text-primary' : 'text-base-content/60'
                  }`} 
                />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-error text-error-content text-xs rounded-full flex items-center justify-center font-medium">
                    {item.badge}
                  </span>
                )}
              </div>
              
              {/* Label */}
              <span className={`text-xs mt-1 truncate transition-colors ${
                active ? 'text-primary font-medium' : 'text-base-content/60'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
        
        {/* More menu */}
        <div className="dropdown dropdown-top dropdown-end">
          <button
            tabIndex={0}
            className="flex flex-col items-center justify-center p-2 min-w-0 flex-1"
          >
            <MoreHorizontal className="h-5 w-5 text-base-content/60" />
            <span className="text-xs mt-1 text-base-content/60">More</span>
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mb-2"
          >
            <li>
              <Link to="/admin/reports" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Reports
              </Link>
            </li>
            <li>
              <Link to="/admin/settings" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Settings
              </Link>
            </li>
            <li>
              <Link to="/" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Back to Home
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;