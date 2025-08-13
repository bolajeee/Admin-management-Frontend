import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  LogOut,
  MessageSquare,
  Settings,
  User,
  LayoutDashboard,
  UserCog,
  X
} from "lucide-react";
import { use, useEffect } from "react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();

  const isAdmin = authUser?.role === "admin";
  const isAdminRoute = location.pathname.startsWith("/admin");


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

          {/* Right side: Settings, Profile, Logout */}
          <div className="flex items-center gap-2">
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
        </div>
      </div>
    </header>
  );
};

export default Navbar;
