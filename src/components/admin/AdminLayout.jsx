import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Bell, 
  Settings, 
  LogOut,
  FileText,
  CheckSquare,
  BarChart2,
  Menu,
  X
} from 'lucide-react';
import { useAdminLayout } from '../../hooks/useAdminLayout';
import { useAuthStore } from '../../store/useAuthStore';

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b px-4 md:justify-center">
            <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
            <button 
              onClick={toggleMobileMenu}
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100 md:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex flex-1 flex-col overflow-y-auto p-4">
            <nav className="flex-1 space-y-1">
              {adminNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={closeMobileMenu}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
            
            <div className="border-t pt-4">
              <button 
                onClick={logout}
                className="flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm md:hidden">
          <h1 className="text-lg font-semibold">
            {adminNavItems.find(item => location.pathname === item.path)?.name || 'Admin'}
          </h1>
          <button 
            onClick={toggleMobileMenu}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
