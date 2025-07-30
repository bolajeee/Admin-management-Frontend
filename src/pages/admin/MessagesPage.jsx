import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { ClipboardList, Mail, FileText, User } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/useChatStore';
import Sidebar from '../../components/Sidebar';
import NoChatSelected from '../../components/NoChatSelected';
import ChatContainer from '../../components/ChatContainer';
import UserMemosPanel from '../../components/UserMemosPanel';
import UserTasksPanel from '../../components/UserTasksPanel';
import UserAvatar from '../../components/ui/UserAvatar';

export default function MessagesPage() {
  const { theme } = useThemeStore();
  const {
    users,
    isUsersLoading,
    getUsers,
    setSelectedUser,
    selectedUser,
  } = useChatStore();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getUsers();
  }, []);

  // If there's an id param, set the selected user
  useEffect(() => {
    if (id && users.length > 0) {
      const user = users.find((u) => u._id === id);
      if (user) {
        setSelectedUser(user);
      } else {
        // If user not found, go back to messages list
        navigate('/admin/messages');
      }
    } else if (!id) {
      setSelectedUser(null);
    }
    // eslint-disable-next-line
  }, [id, users]);

  // Helper: get user online status (stub, replace with real logic if available)
  const getUserStatus = (user) => user.online ? 'online' : 'offline';
  const getUserStatusColor = (status) => status === 'online' ? 'bg-green-400' : 'bg-gray-400';
  // Helper: get last message preview (stub, replace with real logic if available)
  const getLastMessagePreview = (user) => user.lastMessage || 'No messages yet';
  const getUnreadCount = (user) => user.unreadCount || 0;

  // If viewing a specific chat, render the HomePage-like chat interface
  if (id && selectedUser) {
    // Determine border and background classes based on theme
    const borderColor = theme === 'dark' ? 'border-base-400' : 'border-base-300';
    const sidebarBg = theme === 'dark' ? 'bg-base-300/80' : 'bg-base-100/90';
    const chatBg = theme === 'dark' ? 'bg-base-200/90' : 'bg-base-100/95';
    const chatShadow = 'shadow-xl';
    const sidebarShadow = 'shadow-lg';
    const textColor = theme === 'dark' ? 'text-base-content' : 'text-base-content';
    const cancelBtn = theme === 'dark'
      ? 'bg-base-300 hover:bg-base-400 border-base-400 text-base-content'
      : 'bg-base-100 hover:bg-base-200 border-base-300 text-base-content';
    return (
      <div className={`${textColor} h-[calc(100vh-4rem)] pt-10 w-full flex justify-center items-center`}>

        {/* Main Chat */}
        <div className={`flex flex-col w-full max-w-6xl h-full border-t ${borderColor} ${chatBg} rounded-xl ${chatShadow} transition-all duration-300`}>
          {/* Chat Header with user info */}
          <div className="px-3 py-2 border-b border-base-300 bg-base-100/90 flex items-center gap-4 rounded-t-xl shadow-sm">
            <button
              className={`btn btn-sm border font-medium rounded-full px-4 py-1 shadow-md transition-all duration-200 ${cancelBtn}`}
              onClick={() => navigate('/admin/messages')}
              title="Back to user list"
            >
              ← Back
            </button>
            <UserAvatar user={selectedUser} size="w-10 h-10" textSize="text-base" showTooltip={true} />
            <div className="flex flex-col flex-1">
              <span className="font-semibold text-base-content text-lg">{selectedUser.name || selectedUser.email}</span>
              <span className="text-xs text-base-content/60">{selectedUser.email}</span>
              <span className="flex items-center gap-1 text-xs mt-1">
                <span className={`w-2 h-2 rounded-full ${getUserStatusColor(getUserStatus(selectedUser))}`}></span>
                {getUserStatus(selectedUser)}
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0 h-0 overflow-y-auto px-2 pb-2 pt-1 bg-base-200/80">
            <ChatContainer showHeader={false} />
          </div>
        </div>
        {/* Floating new message button (mobile) */}
        <Link to="/admin/messages" className="btn btn-primary fixed bottom-6 right-6 z-40 shadow-lg rounded-full md:hidden" title="New Message">
          <Mail className="h-6 w-6" />
        </Link>
      </div>
    );
  }

  // Otherwise, show the user list as before
  return (
    <div data-theme={theme} className="px-2 pt-4">
      <h1 className="text-2xl font-bold mb-4 text-primary">Messages</h1>
      {/* Users List */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle>All Users</CardTitle>
          <span className="text-base-content/60 text-sm">({users.length})</span>
        </CardHeader>
        <CardContent className="pt-2">
          {isUsersLoading ? (
            <div className="text-base-content/70">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-base-content/70">No users found.</div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => {
                const status = getUserStatus(user);
                const unread = getUnreadCount(user);
                return (
                  <div
                    key={user._id}
                    className="flex flex-col gap-2 p-5 rounded-xl bg-base-100 border border-base-300 shadow-md transition-all duration-300 hover:shadow-2xl hover:-rotate-2 hover:scale-[1.025] hover:z-10 cursor-pointer group relative"
                    style={{ background: 'linear-gradient(135deg, rgba(245,245,255,0.7) 0%, rgba(230,240,255,0.5) 100%)' }}
                  >
                    {/* Online status badge */}
                    <span className={`absolute top-4 left-4 w-3 h-3 rounded-full border-2 border-base-100 ${getUserStatusColor(status)}`} title={status}></span>
                    <div className="flex items-center gap-3 mb-1">
                      <UserAvatar user={user} size="w-12 h-12" textSize="text-lg" showTooltip={true} tooltipZIndex={100} />
                      <div className="flex flex-col flex-1">
                        <span className="font-semibold text-base-content text-lg">{user.name || user.email}</span>
                        <span className="text-xs text-base-content/60">{user.email}</span>
                        <span className="text-xs text-base-content/60 mt-1">{getLastMessagePreview(user)}</span>
                      </div>
                      {unread > 0 && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary text-white shadow" title="Unread messages">{unread}</span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Link to={`/admin/messages/${user._id}`} className="btn btn-sm btn-primary flex items-center gap-1 rounded-full px-4 py-2 text-base-content font-medium shadow hover:shadow-md" title="Open chat">
                        <Mail className="h-4 w-4" /> Message
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
