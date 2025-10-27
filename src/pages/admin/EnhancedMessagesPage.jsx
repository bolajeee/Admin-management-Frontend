import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Search,
  Filter,
  Users,
  Clock,
  Check,
  CheckCheck,
  Paperclip,
  Image,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  Archive,
  Star,
  Trash2
} from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { axiosInstance } from '../../lib/axios';
import UserAvatar from '../../components/ui/UserAvatar';
import toast from 'react-hot-toast';

const EnhancedMessagesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [messageFilter, setMessageFilter] = useState('all'); // all, unread, starred
  
  const { users, getUsers, isUsersLoading } = useChatStore();
  const { authUser } = useAuthStore();

  // Fetch users and recent messages on mount
  useEffect(() => {
    getUsers();
    fetchRecentMessages();
  }, []);

  // Handle user selection from URL params
  useEffect(() => {
    if (id && users.length > 0) {
      const user = users.find(u => u._id === id);
      if (user) {
        setSelectedUser(user);
        fetchConversation(id);
      }
    }
  }, [id, users]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRecentMessages = async () => {
    try {
      const response = await axiosInstance.get('/messages/recent');
      setRecentMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching recent messages:', error);
    }
  };

  const fetchConversation = async (userId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/messages/userMessage/${userId}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      toast.error('Failed to load conversation');
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || sending) return;

    setSending(true);
    try {
      const response = await axiosInstance.post(`/messages/user/${selectedUser._id}`, {
        text: newMessage.trim()
      });

      // Add message to local state immediately for better UX
      const newMsg = {
        _id: Date.now().toString(),
        text: newMessage.trim(),
        senderId: authUser._id,
        receiverId: selectedUser._id,
        createdAt: new Date().toISOString(),
        status: 'sent'
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // Update recent messages
      fetchRecentMessages();
      
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    navigate(`/admin/messages/${user._id}`);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser) return;

    // Handle file upload logic here
    toast.info('File upload functionality coming soon');
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getMessageStatus = (message) => {
    if (message.senderId === authUser._id) {
      switch (message.status) {
        case 'sent':
          return <Check className="h-3 w-3 text-base-content/40" />;
        case 'delivered':
          return <CheckCheck className="h-3 w-3 text-base-content/40" />;
        case 'read':
          return <CheckCheck className="h-3 w-3 text-primary" />;
        default:
          return <Clock className="h-3 w-3 text-base-content/40" />;
      }
    }
    return null;
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    return (
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-base-100 rounded-lg shadow-lg overflow-hidden">
      {/* Users Sidebar */}
      <div className="w-80 border-r border-base-300 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-base-content flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Messages
            </h2>
            <div className="flex items-center gap-2">
              <button className="btn btn-ghost btn-sm btn-circle">
                <Filter className="h-4 w-4" />
              </button>
              <button className="btn btn-ghost btn-sm btn-circle">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full pl-10 input-sm"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 mt-3">
            {['all', 'unread', 'starred'].map((filter) => (
              <button
                key={filter}
                onClick={() => setMessageFilter(filter)}
                className={`btn btn-xs ${
                  messageFilter === filter ? 'btn-primary' : 'btn-ghost'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="p-4 border-b border-base-300">
          <h3 className="text-sm font-medium text-base-content/70 mb-2">Recent</h3>
          <div className="space-y-1">
            {recentMessages.slice(0, 3).map((msg, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                <UserAvatar user={msg.user} size="w-6 h-6" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-base-content/80 truncate">
                    {msg.lastMessage}
                  </p>
                </div>
                <span className="text-xs text-base-content/50">
                  {formatMessageTime(msg.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {isUsersLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="w-10 h-10 bg-base-300 rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-base-300 rounded w-3/4"></div>
                    <div className="h-3 bg-base-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2">
              {filteredUsers.map((user) => (
                <motion.button
                  key={user._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleUserSelect(user)}
                  className={`w-full p-3 flex items-center gap-3 rounded-lg transition-colors text-left ${
                    selectedUser?._id === user._id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-base-200'
                  }`}
                >
                  <UserAvatar user={user} size="w-10 h-10" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-base-content truncate">
                        {user.name || user.email}
                      </h4>
                      <span className="text-xs text-base-content/50">
                        {user.lastSeen && formatMessageTime(user.lastSeen)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-base-content/60 truncate">
                        {user.role} • {user.department || 'No department'}
                      </p>
                      {user.unreadCount > 0 && (
                        <span className="badge badge-primary badge-sm">
                          {user.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-base-300 bg-base-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar user={selectedUser} size="w-10 h-10" />
                  <div>
                    <h3 className="font-semibold text-base-content">
                      {selectedUser.name || selectedUser.email}
                    </h3>
                    <p className="text-sm text-base-content/60">
                      {selectedUser.isOnline ? 'Online' : 'Last seen recently'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="btn btn-ghost btn-sm btn-circle">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="btn btn-ghost btn-sm btn-circle">
                    <Video className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setShowUserInfo(!showUserInfo)}
                    className="btn btn-ghost btn-sm btn-circle"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="loading loading-spinner loading-lg text-primary"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <MessageSquare className="h-12 w-12 text-base-content/30 mx-auto mb-3" />
                    <p className="text-base-content/60">No messages yet</p>
                    <p className="text-sm text-base-content/40">
                      Start a conversation with {selectedUser.name || selectedUser.email}
                    </p>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((message, index) => {
                    const isOwn = message.senderId === authUser._id;
                    const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
                    
                    return (
                      <motion.div
                        key={message._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwn && showAvatar && (
                          <UserAvatar 
                            user={selectedUser} 
                            size="w-8 h-8" 
                            className="mt-auto"
                          />
                        )}
                        {!isOwn && !showAvatar && <div className="w-8"></div>}
                        
                        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : ''}`}>
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isOwn
                                ? 'bg-primary text-primary-content'
                                : 'bg-base-200 text-base-content'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                          
                          <div className={`flex items-center gap-1 mt-1 ${
                            isOwn ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className="text-xs text-base-content/50">
                              {formatMessageTime(message.createdAt)}
                            </span>
                            {getMessageStatus(message)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-base-300 bg-base-50">
              <form onSubmit={sendMessage} className="flex items-end gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={handleFileUpload}
                      className="btn btn-ghost btn-sm btn-circle"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-circle"
                    >
                      <Image className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-circle"
                    >
                      <Smile className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="textarea textarea-bordered w-full resize-none"
                    rows="2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(e);
                      }
                    }}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="btn btn-primary btn-circle"
                >
                  {sending ? (
                    <div className="loading loading-spinner loading-sm"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-base-content mb-2">
                Select a conversation
              </h3>
              <p className="text-base-content/60">
                Choose a user from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* User Info Sidebar */}
      <AnimatePresence>
        {showUserInfo && selectedUser && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-base-300 bg-base-50 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">User Info</h3>
                <button
                  onClick={() => setShowUserInfo(false)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  ×
                </button>
              </div>
              
              <div className="text-center mb-6">
                <UserAvatar user={selectedUser} size="w-16 h-16" className="mx-auto mb-3" />
                <h4 className="font-semibold text-base-content">
                  {selectedUser.name || selectedUser.email}
                </h4>
                <p className="text-sm text-base-content/60">{selectedUser.role}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-base-content/70">Email</label>
                  <p className="text-sm text-base-content">{selectedUser.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-base-content/70">Department</label>
                  <p className="text-sm text-base-content">
                    {selectedUser.department || 'Not assigned'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-base-content/70">Status</label>
                  <p className="text-sm text-base-content">
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>

                <div className="pt-4 border-t border-base-300">
                  <div className="space-y-2">
                    <button className="btn btn-ghost btn-sm w-full justify-start gap-2">
                      <Star className="h-4 w-4" />
                      Star Conversation
                    </button>
                    <button className="btn btn-ghost btn-sm w-full justify-start gap-2">
                      <Archive className="h-4 w-4" />
                      Archive Chat
                    </button>
                    <button className="btn btn-ghost btn-sm w-full justify-start gap-2 text-error">
                      <Trash2 className="h-4 w-4" />
                      Delete Conversation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedMessagesPage;