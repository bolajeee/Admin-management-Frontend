import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  CheckSquare,
  BarChart2,
  Menu,
  X
} from 'lucide-react';
import { useAdminLayout } from '../../hooks/useAdminLayout';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';

const adminNavItems = [
  { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: 'Employees', path: '/admin/employees', icon: <Users className="h-5 w-5" /> },
  { name: 'Messages', path: '/admin/messages', icon: <MessageSquare className="h-5 w-5" /> },
  { name: 'Memos', path: '/admin/memos', icon: <Bell className="h-5 w-5" /> },
  { name: 'Tasks', path: '/admin/tasks', icon: <CheckSquare className="h-5 w-5" /> },
  { name: 'Reports', path: '/admin/reports', icon: <BarChart2 className="h-5 w-5" /> },
  { name: 'Settings', path: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
];

export default function AdminLayout() {
  const { mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useAdminLayout();
  const { logout } = useAuthStore();
  const location = useLocation();
  const { theme } = useThemeStore();

  return (
    <div className="h-screen flex overflow-hidden bg-base-100" data-theme={theme}>
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`z-50 w-64 transform bg-base-200 border-r border-base-300 shadow-lg transition-transform duration-300 ease-in-out 
          fixed top-16 inset-y-0 left-0 
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-base-300 px-4 md:justify-center bg-base-100">
            <h1 className="text-xl font-bold text-primary tracking-wide">Admin Panel</h1>
            <button
              onClick={toggleMobileMenu}
              className="rounded-md p-1 text-base-content/60 hover:bg-base-300 md:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            <nav className="space-y-1">
              {adminNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${location.pathname === item.path
                    ? 'bg-primary/10 text-primary shadow-sm scale-[1.03]'
                    : 'text-base-content hover:bg-primary/5 hover:text-primary'
                    }`}
                  onClick={closeMobileMenu}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="border-t border-base-300 pt-4 mt-auto">
              <button
                onClick={logout}
                className="flex items-center rounded-lg px-4 py-3 text-sm font-medium text-error transition-colors hover:bg-error/10 hover:scale-[1.03]"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Toggle Icon */}
      {!mobileMenuOpen && (
  <button
    onClick={toggleMobileMenu}
    className="fixed top-20 left-4 z-50 p-2 rounded-md shadow-md bg-primary text-white md:hidden"
  >
    <Menu className="w-5 h-5" />
  </button>
)}


      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-screen md:ml-64">
        <header className="h-16 flex items-center justify-between px-4 border-b border-base-300 bg-base-100/80 backdrop-blur z-30 shadow-sm">
          <h1 className="text-lg font-semibold text-primary">
            {adminNavItems.find(item => location.pathname === item.path)?.name || 'Admin'}
          </h1>
          <button
            onClick={toggleMobileMenu}
            className="rounded-md p-2 text-base-content/60 hover:bg-base-300 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-base-100">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
