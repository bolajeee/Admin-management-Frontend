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
  X,
  ChevronRight,
  Home,
  UserCog,
  FileText,
  Activity
} from 'lucide-react';
import { useAdminLayout } from '../../hooks/useAdminLayout';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';

const adminNavItems = [
  {
    section: 'Main',
    items: [
      { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="h-5 w-5" />, description: 'Overview & Analytics' },
    ]
  },
  {
    section: 'Management',
    items: [
      { name: 'Employees', path: '/admin/employees', icon: <Users className="h-5 w-5" />, description: 'User Management' },
      { name: 'Messages', path: '/admin/messages', icon: <MessageSquare className="h-5 w-5" />, description: 'Communication' },
      { name: 'Memos', path: '/admin/memos', icon: <Bell className="h-5 w-5" />, description: 'Announcements' },
      { name: 'Tasks', path: '/admin/tasks', icon: <CheckSquare className="h-5 w-5" />, description: 'Task Management' },
    ]
  },
  {
    section: 'Analytics',
    items: [
      { name: 'Reports', path: '/admin/reports', icon: <BarChart2 className="h-5 w-5" />, description: 'Data & Reports' },
    ]
  },
  {
    section: 'System',
    items: [
      { name: 'Settings', path: '/admin/settings', icon: <Settings className="h-5 w-5" />, description: 'System Configuration' },
    ]
  }
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

      {/* Enhanced Sidebar */}
      <div
        className={`z-50 w-72 transform bg-base-200 border-r border-base-300 shadow-lg transition-transform duration-300 ease-in-out 
          fixed top-0 inset-y-0 left-0 
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-base-300 px-6 bg-base-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserCog className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary">Admin Panel</h1>
                <p className="text-xs text-base-content/60">Management Console</p>
              </div>
            </div>
            <button
              onClick={toggleMobileMenu}
              className="rounded-md p-2 text-base-content/60 hover:bg-base-300 md:hidden transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-4 py-6 space-y-6">
              {adminNavItems.map((section) => (
                <div key={section.section}>
                  <h3 className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-3 px-2">
                    {section.section}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 relative ${location.pathname === item.path
                            ? 'bg-primary/10 text-primary shadow-sm border-l-4 border-primary'
                            : 'text-base-content hover:bg-base-300 hover:text-primary'
                          }`}
                        onClick={closeMobileMenu}
                      >
                        <span className="mr-3 group-hover:scale-110 transition-transform">
                          {item.icon}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-base-content/60 group-hover:text-base-content/80">
                            {item.description}
                          </div>
                        </div>
                        {location.pathname === item.path && (
                          <ChevronRight className="h-4 w-4 text-primary" />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div className="border-t border-base-300 p-4">
              <button
                onClick={logout}
                className="flex items-center w-full rounded-lg px-3 py-3 text-sm font-medium text-error transition-all duration-200 hover:bg-error/10 hover:scale-[1.02] group"
              >
                <LogOut className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
                <div>
                  <div className="font-medium">Logout</div>
                  <div className="text-xs text-error/60">Sign out of admin panel</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      {!mobileMenuOpen && (
        <button
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-50 p-3 rounded-lg shadow-lg bg-primary text-white md:hidden hover:bg-primary/90 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-screen md:ml-72">
        {/* Enhanced Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-base-300 bg-base-100/80 backdrop-blur z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-primary">
              {adminNavItems.flatMap(section => section.items).find(item => location.pathname === item.path)?.name || 'Admin'}
            </h1>
            <div className="hidden md:flex items-center gap-2 text-sm text-base-content/60">
              <Home className="h-4 w-4" />
              <span>/</span>
              <span>Admin</span>
              {location.pathname !== '/admin' && (
                <>
                  <span>/</span>
                  <span className="text-primary">
                    {adminNavItems.flatMap(section => section.items).find(item => location.pathname === item.path)?.name}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-base-content/60">
              <Activity className="h-4 w-4" />
              <span>Admin Console</span>
            </div>
            <button
              onClick={toggleMobileMenu}
              className="rounded-lg p-2 text-base-content/60 hover:bg-base-300 md:hidden transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-base-100">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
