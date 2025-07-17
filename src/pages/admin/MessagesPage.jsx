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
          {/* Cancel Button */}
          <div className="px-3 py-2 border-b border-base-300 bg-transparent flex items-center justify-between rounded-t-xl">
            <button
              className={`btn btn-sm border font-medium rounded-full px-4 py-1 shadow-md transition-all duration-200 ${cancelBtn}`}
              onClick={() => navigate('/admin/messages')}
            >
              Cancel
            </button>
            <span className="font-semibold text-lg text-primary">Chat</span>
          </div>
          <div className="flex-1 min-h-0 h-0 overflow-y-auto px-2 pb-2 pt-1">
            <ChatContainer showHeader={false} />
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, show the user list as before
  return (
    <div data-theme={theme} className="px-2 pt-4">
      <h1 className="text-2xl font-bold mb-4 text-primary">Messages</h1>
      {/* Users List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {isUsersLoading ? (
            <div className="text-base-content/70">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-base-content/70">No users found.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex flex-col gap-1 p-3 rounded-xl bg-base-100 shadow-md transition-all duration-300 hover:shadow-2xl hover:-rotate-2 hover:scale-[1.025] hover:z-10 border border-base-300 cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <UserAvatar user={user} size="w-10 h-10" textSize="text-base" showTooltip={true} />
                    <span className="font-semibold text-base-content text-base">{user.name || user.email}</span>
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/admin/messages/${user._id}`} className="btn btn-xs btn-primary flex items-center gap-1 rounded-full px-3 py-1 text-base-content font-medium shadow hover:shadow-md">
                      <Mail className="h-4 w-4" /> Message
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
