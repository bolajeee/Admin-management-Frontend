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

/**
 * AdminLayout - Main layout for all admin pages.
 * 
 * Features:
 * - Responsive sidebar navigation for admin sections.
 * - Mobile-friendly menu toggle.
 * - Header with breadcrumbs and context.
 * - Logout functionality.
 * - Accessible navigation and controls.
 * 
 * Usage:
 * Wrap all admin routes with this layout for consistent UI and navigation.
 */

// Navigation items for sidebar, grouped by section
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
  // Custom hook for mobile menu state
  const { mobileMenuOpen, toggleMobileMenu, closeMobileMenu, isSidebarCollapsed, toggleSidebarCollapse } = useAdminLayout();
  // Auth store for logout
  const { logout } = useAuthStore();
  // Router location for active nav highlighting
  const location = useLocation();
  // Theme store for dark/light mode
  const { theme } = useThemeStore();

  return (
    <div className="h-screen flex bg-base-100" data-theme={theme}>
      {/* Mobile menu overlay for accessibility */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileMenu}
          aria-label="Close mobile menu"
          tabIndex={0}
        />
      )}

      {/* Sidebar navigation */}
      <div
        className={`w-72 transform bg-base-200 border-r border-base-300 shadow-lg transition-transform duration-300 ease-in-out 
          fixed top-0 inset-y-0 left-0 z-50 
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        aria-label="Admin sidebar navigation"
      >
        <div className="flex h-full flex-col">
         {/* Mobile close button */}
                                   {/* <button
                                     onClick={toggleMobileMenu}
                                     className="absolute top-8 right-4 rounded-md p-2 text-base-content/60 hover:bg-base-300 md:hidden transition-colors"
                                     aria-label="Close sidebar"
                                   >
                                     <X className="h-5 w-5" />
                                   </button> */}

          {/* Sidebar navigation links */}
          <div className="flex-1 flex flex-col pt-6 overflow-y-auto">
            <nav className="flex-1 px-4 py-6 space-y-6" aria-label="Admin navigation">
              {adminNavItems.map((section) => (
                <div key={section.section}>
                  <h3 className={`text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-3 px-2 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
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
                          } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                        onClick={closeMobileMenu}
                        aria-current={location.pathname === item.path ? "page" : undefined}
                      >
                        <span className={`mr-3 group-hover:scale-110 transition-transform ${isSidebarCollapsed ? 'mr-0' : ''}`}>
                          {item.icon}
                        </span>
                        <div className={`flex-1 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
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

            {/* Sidebar footer with logout */}
            <div className="border-t border-base-300 p-4">
              <button
                onClick={logout}
                className="flex items-center w-full rounded-lg px-3 py-3 text-sm font-medium text-error transition-all duration-200 hover:bg-error/10 hover:scale-[1.02] group"
                aria-label="Logout"
              >
                <LogOut className={`mr-3 h-5 w-5 group-hover:rotate-12 transition-transform ${isSidebarCollapsed ? 'mr-0' : ''}`} />
                <div className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>
                  <div className="font-medium">Logout</div>
                  <div className="text-xs text-error/60">Sign out of admin panel</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu toggle button */}
      {!mobileMenuOpen && (
        <button
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-50 p-3 rounded-lg shadow-lg bg-primary text-white md:hidden hover:bg-primary/90 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col h-screen overflow-x-hidden md:ml-72">
        {/* Header with breadcrumbs */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-base-300 bg-base-100/80 backdrop-blur z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-primary">
              {/* Show current section name or fallback */}
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
            {/* Mobile menu toggle in header */}
            <button
              onClick={toggleMobileMenu}
              className="rounded-lg p-2 text-base-content/60 hover:bg-base-300 md:hidden transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Desktop sidebar collapse toggle */}
            <button
              onClick={toggleSidebarCollapse}
              className="hidden md:block rounded-lg p-2 text-base-content/60 hover:bg-base-300 transition-colors"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Main content outlet for admin pages */}
        <main className="flex-1 overflow-y-auto bg-base-100">
          <div className="p-6">
            {/* Renders the current admin page */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}