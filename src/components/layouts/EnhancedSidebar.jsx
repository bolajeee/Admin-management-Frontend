import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  MessageSquare, 
  Phone, 
  Video, 
  Star,
  Archive,
  Settings,
  Clock,
  CheckCircle,
  Circle
} from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { axiosInstance } from "../../lib/axios";
import UserAvatar from "../ui/UserAvatar";
import toast from "react-hot-toast";

const EnhancedSidebar = ({ searchTerm = "" }) => {
  const { getUsers, users, selectedUser, setSelectedUser, isUserLoading, getConversations, conversations, isConversationsLoading } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [filter, setFilter] = useState('all'); // all, online, starred, archived
  const [sortBy, setSortBy] = useState('recent'); // recent, name, status
  const [recentMessages, setRecentMessages] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  useEffect(() => {
    getUsers();
    getConversations();
    fetchRecentMessages();
  }, [getUsers, getConversations]);

  const fetchRecentMessages = async () => {
    setLoadingRecent(true);
    try {
      const response = await axiosInstance.get('/messages/recent');
      setRecentMessages(response.data.data?.messages || []);
    } catch (error) {
      console.error('Error fetching recent messages:', error);
    } finally {
      setLoadingRecent(false);
    }
  };

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      // Search filter
      const matchesSearch = !searchTerm || 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Status filter
      switch (filter) {
        case 'online':
          return onlineUsers.includes(user._id);
        case 'starred':
          return user.isStarred; // Assuming this field exists
        case 'archived':
          return user.isArchived; // Assuming this field exists
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || a.email).localeCompare(b.name || b.email);
        case 'status':
          const aOnline = onlineUsers.includes(a._id);
          const bOnline = onlineUsers.includes(b._id);
          return bOnline - aOnline;
        default: // recent
          return new Date(b.lastMessage?.timestamp || 0) - new Date(a.lastMessage?.timestamp || 0);
      }
    });

  const getLastMessagePreview = (user) => {
    // Find the most recent message involving this user
    const userMessages = recentMessages.filter(msg => 
      (msg.sender?._id === user._id && msg.receiver?._id === authUser._id) ||
      (msg.sender?._id === authUser._id && msg.receiver?._id === user._id)
    );
    
    if (userMessages.length > 0) {
      const lastMessage = userMessages[0];
      return lastMessage.text || (lastMessage.image ? "📷 Image" : "Message");
    }
    
    return "No messages yet";
  };

  const getLastMessageTime = (user) => {
    // Find the most recent message involving this user
    const userMessages = recentMessages.filter(msg => 
      (msg.sender?._id === user._id && msg.receiver?._id === authUser._id) ||
      (msg.sender?._id === authUser._id && msg.receiver?._id === user._id)
    );
    
    if (userMessages.length > 0) {
      const timestamp = new Date(userMessages[0].createdAt);
      const now = new Date();
      const diffInHours = (now - timestamp) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        return `${Math.floor(diffInHours * 60)}m`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h`;
      } else {
        return timestamp.toLocaleDateString();
      }
    }
    
    return "";
  };

  const hasUnreadMessages = (user) => {
    // Check if there are unread messages from this user
    const userMessages = recentMessages.filter(msg => 
      msg.sender?._id === user._id && 
      msg.receiver?._id === authUser._id &&
      !msg.readAt
    );
    return userMessages.length > 0;
  };

  if (isUserLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-base-300 rounded animate-pulse"></div>
            <div className="w-20 h-4 bg-base-300 rounded animate-pulse"></div>
          </div>
          <div className="w-full h-10 bg-base-300 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 p-4 space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 bg-base-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="w-3/4 h-4 bg-base-300 rounded"></div>
                <div className="w-1/2 h-3 bg-base-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-base-100">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-base-content">Conversations</h2>
          </div>
          <div className="flex items-center gap-1">
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
                <Filter className="h-4 w-4" />
              </button>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                <li><button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All</button></li>
                <li><button onClick={() => setFilter('online')} className={filter === 'online' ? 'active' : ''}>Online</button></li>
                <li><button onClick={() => setFilter('starred')} className={filter === 'starred' ? 'active' : ''}>Starred</button></li>
                <li><button onClick={() => setFilter('archived')} className={filter === 'archived' ? 'active' : ''}>Archived</button></li>
              </ul>
            </div>
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
                <MoreVertical className="h-4 w-4" />
              </button>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                <li><button onClick={() => setSortBy('recent')} className={sortBy === 'recent' ? 'active' : ''}>Recent</button></li>
                <li><button onClick={() => setSortBy('name')} className={sortBy === 'name' ? 'active' : ''}>Name</button></li>
                <li><button onClick={() => setSortBy('status')} className={sortBy === 'status' ? 'active' : ''}>Status</button></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Search Input (if not provided from parent) */}
        {!searchTerm && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="input input-bordered w-full pl-10 input-sm"
              onChange={(e) => {
                // Trigger search in parent component
                if (window.updateSearchTerm) {
                  window.updateSearchTerm(e.target.value);
                }
              }}
            />
          </div>
        )}

        {/* Filter Chips */}
        <div className="flex gap-2 mt-3">
          <span className="badge badge-sm badge-primary">
            {filteredUsers.length} conversations
          </span>
          {onlineUsers.length > 0 && (
            <span className="badge badge-sm badge-success">
              {onlineUsers.length} online
            </span>
          )}
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageSquare className="h-12 w-12 text-base-content/30 mb-3" />
            <p className="text-base-content/60 mb-2">No conversations found</p>
            <p className="text-sm text-base-content/40">
              {searchTerm ? 'Try adjusting your search' : 'Start a new conversation'}
            </p>
          </div>
        ) : (
          <div className="p-2">
            <AnimatePresence>
              {filteredUsers.map((user, index) => {
                const isSelected = selectedUser?._id === user._id;
                const isOnline = onlineUsers.includes(user._id);
                const lastMessage = getLastMessagePreview(user);
                const lastTime = getLastMessageTime(user);
                const hasUnread = hasUnreadMessages(user);

                return (
                  <motion.button
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full p-3 rounded-lg transition-all duration-200 text-left group ${
                      isSelected
                        ? 'bg-primary/10 border border-primary/20 shadow-sm'
                        : 'hover:bg-base-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar with Status */}
                      <div className="relative flex-shrink-0">
                        <UserAvatar user={user} size="w-12 h-12" />
                        {isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success rounded-full border-2 border-base-100 flex items-center justify-center">
                            <div className="w-2 h-2 bg-success-content rounded-full animate-pulse"></div>
                          </div>
                        )}
                        {hasUnread && !isSelected && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-medium truncate ${
                            isSelected ? 'text-primary' : 'text-base-content'
                          } ${hasUnread && !isSelected ? 'font-semibold' : ''}`}>
                            {user.name || user.email}
                          </h4>
                          <div className="flex items-center gap-1">
                            {user.isStarred && (
                              <Star className="h-3 w-3 text-warning fill-current" />
                            )}
                            <span className="text-xs text-base-content/50">
                              {lastTime}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate ${
                            hasUnread && !isSelected 
                              ? 'text-base-content font-medium' 
                              : 'text-base-content/60'
                          }`}>
                            {lastMessage}
                          </p>
                          
                          <div className="flex items-center gap-1 ml-2">
                            {hasUnread && !isSelected && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                            {isSelected && (
                              <CheckCircle className="h-3 w-3 text-primary" />
                            )}
                          </div>
                        </div>

                        {/* User Status/Role */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-base-200 text-base-content/60'
                          }`}>
                            {user.role || 'User'}
                          </span>
                          {isOnline && (
                            <span className="text-xs text-success font-medium">Online</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Hover Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-end gap-1 mt-2">
                      <button className="btn btn-ghost btn-xs btn-circle">
                        <MoreVertical className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-base-300">
        <div className="flex items-center justify-center text-xs text-base-content/60">
          <span>{filteredUsers.length} conversations</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSidebar;