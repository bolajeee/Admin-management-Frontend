import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  LogOut,
  MessageSquare,
  Settings,
  User,
  LayoutDashboard,
  UserCog,
  Menu,
  X,
  Bell,
  Palette,
  Search,
  Command,
  Home,
  Users,
  FileText,
  CheckSquare,
  BarChart3,
  Shield
} from "lucide-react";
import { useState, useEffect } from "react";
import NotificationCenter from "./ui/NotificationCenter";
import ThemeSelector from "./ui/ThemeSelector";
import GlobalSearch from "./ui/GlobalSearch";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const isAdmin = authUser?.role?.name === "admin" || authUser?.isAdmin;
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowNotifications(false);
        setShowThemeSelector(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Get current page info for breadcrumbs
  const getCurrentPageInfo = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Dashboard', icon: Home };
    if (path === '/admin') return { title: 'Admin Dashboard', icon: LayoutDashboard };
    if (path.includes('/admin/employees')) return { title: 'Employee Management', icon: Users };
    if (path.includes('/admin/memos')) return { title: 'Memo Management', icon: FileText };
    if (path.includes('/admin/tasks')) return { title: 'Task Management', icon: CheckSquare };
    if (path.includes('/admin/reports')) return { title: 'Reports & Analytics', icon: BarChart3 };
    if (path.includes('/admin/messages')) return { title: 'Message Center', icon: MessageSquare };
    if (path.includes('/admin/settings')) return { title: 'System Settings', icon: Settings };
    if (path.includes('/profile')) return { title: 'Profile Settings', icon: User };
    if (path.includes('/settings')) return { title: 'Settings', icon: Settings };
    return { title: 'Dashboard', icon: Home };
  };

  const currentPage = getCurrentPageInfo();

  return (
    <header className={`fixed top-0 z-50 border-b border-base-300 backdrop-blur-lg bg-base-100/95 w-full shadow-sm ${isAdminRoute ? 'lg:pl-64 transition-all duration-300' : ''
      }`}>
      <div className={`h-16 px-4 ${!isAdminRoute ? 'container mx-auto' : 'w-full'}`}>
        <div className="flex items-center justify-between h-full">
          {/* Left side: Logo & Breadcrumbs */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className={`text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent ${isAdminRoute ? 'hidden lg:block' : ''}`}>
                {isAdminRoute ? 'Admin Panel' : 'AdminFlow'}
              </h1>
            </Link>

            {/* Breadcrumbs */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              <div className="text-base-content/40">/</div>
              <div className="flex items-center gap-2 text-base-content/80">
                <currentPage.icon className="h-4 w-4" />
                <span className="font-medium">{currentPage.title}</span>
              </div>
            </div>

            {/* Quick Navigation */}
            {isAdmin && !isAdminRoute && (
              <Link
                to="/admin"
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-base-content/70 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin Panel
              </Link>
            )}

            {isAdmin && isAdminRoute && (
              <Link
                to="/"
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-base-content/70 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            )}
          </div>

          {/* Right side: Search, Notifications, Theme, Settings, Profile, Logout (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {/* Quick Search */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="btn btn-sm btn-ghost hover:bg-base-200"
              title="Quick Search (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="btn btn-sm btn-ghost hover:bg-base-200 relative"
                title="Notifications"
              >
                <Bell className={`w-4 h-4 ${notificationCount > 0 ? 'text-primary' : ''}`} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-error rounded-full text-xs flex items-center justify-center text-white font-medium">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </button>
              <NotificationCenter
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                onNotificationCountChange={setNotificationCount}
              />
            </div>

            {/* Theme Selector */}
            <button
              onClick={() => setShowThemeSelector(true)}
              className="btn btn-sm btn-ghost hover:bg-base-200"
              title="Change Theme"
            >
              <Palette className="w-4 h-4" />
            </button>

            <Link
              to="/settings"
              className={`btn btn-sm btn-ghost hover:bg-base-200 gap-2 ${isAdminRoute ? 'hidden lg:flex' : ''
                }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link
                  to="/profile"
                  className={`btn btn-sm btn-ghost hover:bg-base-200 gap-2 ${isAdminRoute ? 'hidden lg:flex' : ''
                    }`}
                >
                  {authUser.profilePicture ? (
                    <img
                      src={authUser.profilePicture}
                      alt={authUser.name || authUser.email}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <span className="hidden sm:inline">
                    {authUser.name || authUser.email}
                  </span>
                </Link>

                <button
                  onClick={logout}
                  className="btn btn-sm btn-ghost hover:bg-base-200 gap-2 text-error hover:text-error"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="btn btn-ghost btn-circle">
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile menu content */}
          {isMobileMenuOpen && (
            <div className="absolute top-16 left-0 w-full bg-base-100 shadow-lg py-2 md:hidden">
              <div className="flex flex-col items-start px-4">
                <Link
                  to="/settings"
                  className="btn btn-ghost w-full justify-start gap-2"
                  onClick={toggleMobileMenu}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>

                {authUser && (
                  <>
                    <Link
                      to="/profile"
                      className="btn btn-ghost w-full justify-start gap-2"
                      onClick={toggleMobileMenu}
                    >
                      {authUser.profilePicture ? (
                        <img
                          src={authUser.profilePicture}
                          alt={authUser.name || authUser.email}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <span>{authUser.name || authUser.email}</span>
                    </Link>

                    <button
                      onClick={() => { logout(); toggleMobileMenu(); }}
                      className="btn btn-ghost w-full justify-start gap-2 text-error hover:text-error"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />

      {/* Theme Selector Modal */}
      <ThemeSelector
        isOpen={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />
    </header>
  );
};

export default Navbar;
