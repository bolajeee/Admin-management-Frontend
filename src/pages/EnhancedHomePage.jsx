import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  CheckSquare,
  Bell,
  Users,
  Search,
  Filter,
  Settings,
  Menu,
  X,
  Plus,
  Star,
  Archive,
  MoreVertical,
  Phone,
  Video,
  Info,
  Send,
  Paperclip,
  Smile,
  Clock,
  Check,
  CheckCheck
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useTaskStore } from "../store/useTaskStore";
import { useMemoStore } from "../store/useMemoStore";
import UserAvatar from "../components/ui/UserAvatar";
import EnhancedSidebar from "../components/layouts/EnhancedSidebar";
import EnhancedChatContainer from "../components/layouts/EnhancedChatContainer";
import EnhancedTaskMemoPanel from "../components/layouts/EnhancedTaskMemoPanel";

const EnhancedHomePage = () => {
  const { selectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("tasks");
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(() => window.innerWidth >= 1280);
  const [searchTerm, setSearchTerm] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
      setIsRightPanelOpen(window.innerWidth >= 1280);
    };

    // Make search function available globally for sidebar
    window.updateSearchTerm = setSearchTerm;

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      delete window.updateSearchTerm;
    };
  }, []);

  const quickActions = [
    { id: 'new-message', label: 'New Message', icon: MessageSquare, color: 'text-blue-500' },
    { id: 'create-task', label: 'Create Task', icon: CheckSquare, color: 'text-green-500' },
    { id: 'send-memo', label: 'Send Memo', icon: Bell, color: 'text-yellow-500' },
    { id: 'view-users', label: 'View Users', icon: Users, color: 'text-purple-500' }
  ];

  return (
    <div className="h-screen flex flex-col bg-base-100">
      {/* Enhanced Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-base-100/80 backdrop-blur-lg border-b border-base-300 flex items-center justify-between p-4 lg:px-6 shadow-sm"
      >
        <div className="flex items-center gap-4">
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden btn btn-ghost btn-circle"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-content" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-base-content">
                {selectedUser ? `Chat with ${selectedUser.name || selectedUser.email}` : 'Welcome Back'}
              </h1>
              <p className="text-xs text-base-content/60">
                {authUser?.name || authUser?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Center Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search conversations, tasks, memos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full pl-10 input-sm bg-base-200/50"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">

          {/* Right Panel Toggle */}
          <button
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className="hidden xl:flex btn btn-ghost btn-circle btn-sm"
            title="Toggle Tasks & Memos Panel"
          >
            <CheckSquare className="w-4 h-4" />
          </button>

          {/* User Menu */}
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
              <UserAvatar user={authUser} size="w-6 h-6" />
            </button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300">
              <li><a href="/profile">Profile</a></li>
              <li><a href="/settings">Settings</a></li>
              {authUser?.role === 'admin' && <li><a href="/admin">Admin Panel</a></li>}
              <li><button className="text-error">Logout</button></li>
            </ul>
          </div>
        </div>
      </motion.header>

      {/* Mobile Search Bar */}
      <div className="md:hidden p-4 border-b border-base-300">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full pl-10 input-sm"
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Enhanced Left Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.aside
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`
                  bg-base-100 border-r border-base-300 flex-shrink-0 w-80
                  ${isSidebarOpen ? 'fixed inset-y-0 left-0 z-50 top-16' : ''} 
                  lg:relative lg:z-auto lg:top-0
                `}
              >
                <EnhancedSidebar searchTerm={searchTerm} />
              </motion.aside>

              {/* Mobile Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 lg:hidden top-16"
                onClick={() => setIsSidebarOpen(false)}
              />
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedUser ? (
            <EnhancedChatContainer />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300"
            >
              <div className="text-center max-w-md mx-auto p-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <MessageSquare className="w-12 h-12 text-primary" />
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-base-content mb-3"
                >
                  Welcome to Your Workspace
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-base-content/70 mb-6"
                >
                  Select a conversation from the sidebar to start messaging, or create a new task to get organized.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                  <button className="btn btn-primary gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Start Conversation
                  </button>
                  <button className="btn btn-outline gap-2">
                    <CheckSquare className="w-4 h-4" />
                    Create Task
                  </button>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-base-300"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">12</div>
                    <div className="text-xs text-base-content/60">Active Chats</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">8</div>
                    <div className="text-xs text-base-content/60">Tasks Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">3</div>
                    <div className="text-xs text-base-content/60">New Memos</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Mobile Task/Memo Panel (Bottom) */}
          <div className="xl:hidden border-t border-base-300">
            <EnhancedTaskMemoPanel 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
              isMobile={true}
            />
          </div>
        </div>

        {/* Enhanced Right Panel (Desktop) */}
        <AnimatePresence>
          {isRightPanelOpen && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="hidden xl:block xl:w-80 bg-base-100 border-l border-base-300"
            >
              <EnhancedTaskMemoPanel 
                activeTab={activeTab} 
                setActiveTab={setActiveTab}
                isMobile={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedHomePage;