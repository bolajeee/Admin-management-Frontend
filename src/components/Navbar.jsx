import { Link, useLocation } from "react-router-dom";
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
  Command
} from "lucide-react";
import { useState } from "react";
import NotificationCenter from "./ui/NotificationCenter";
import ThemeSelector from "./ui/ThemeSelector";
import GlobalSearch from "./ui/GlobalSearch";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const isAdmin = authUser?.role === "admin";
  const isAdminRoute = location.pathname.startsWith("/admin");

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={`fixed top-0 z-40 border-b border-base-300 backdrop-blur-lg bg-base-100/80 w-full ${
      isAdminRoute ? 'lg:pl-64 transition-all duration-300' : ''
    }`}>
      <div className={`h-16 px-4 ${!isAdminRoute ? 'container mx-auto' : 'w-full'}`}>
        <div className="flex items-center justify-between h-full">
          {/* Left side: Logo & Admin links */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className={`text-lg font-bold ${isAdminRoute ? 'hidden lg:block' : ''}`}>
                {isAdminRoute ? 'Admin Panel' : 'Chatty'}
              </h1>
            </Link>

            {/* Admin Links */}
            {isAdmin && !isAdminRoute && (
              <Link
                to="/admin"
                className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </Link>
            )}

            {isAdmin && isAdminRoute && (
              <Link
                to="/"
                className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Back to HOME
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
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full text-xs flex items-center justify-center text-white">
                  3
                </span>
              </button>
              <NotificationCenter 
                isOpen={showNotifications} 
                onClose={() => setShowNotifications(false)} 
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
              className={`btn btn-sm btn-ghost hover:bg-base-200 gap-2 ${
                isAdminRoute ? 'hidden lg:flex' : ''
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link 
                  to="/profile" 
                  className={`btn btn-sm btn-ghost hover:bg-base-200 gap-2 ${
                    isAdminRoute ? 'hidden lg:flex' : ''
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
