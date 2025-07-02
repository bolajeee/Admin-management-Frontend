import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { ClipboardList, Mail, FileText, User } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { Link } from 'react-router-dom';
import { useChatStore } from '../../store/useChatStore';

export default function MessagesPage() {
  const { theme } = useThemeStore();
  const {
    users,
    memos,
    isUsersLoading,
    isMemosLoading,
    getUsers,
    getMemos,
    // Optionally: error states
  } = useChatStore();

  useEffect(() => {
    getUsers();
    getMemos();
    // eslint-disable-next-line
  }, []);

  return (
    <div data-theme={theme}>
      <h1 className="text-2xl font-bold mb-6 pt-[70px]">Messages</h1>
      {/* Company-wide Memos */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Company-wide Memos</CardTitle>
        </CardHeader>
        <CardContent>
          {isMemosLoading ? (
            <div>Loading memos...</div>
          ) : memos.length === 0 ? (
            <p className="text-base-content/70">No memos available.</p>
          ) : (
            <ul className="space-y-2">
              {memos.map((memo) => (
                <li key={memo._id} className="p-2 rounded bg-base-200">
                  <div className="font-semibold text-base-content">{memo.title}</div>
                  <div className="text-sm text-base-content/70">{memo.content}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isUsersLoading ? (
            <div>Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-base-content/70">No users found.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <div key={user._id} className="flex flex-col gap-2 p-4 rounded-lg bg-base-100 shadow hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-5 w-5 text-primary" />
                    <span className="font-medium text-base-content">{user.name || user.email}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/admin/messages/${user._id}`} className="btn btn-sm btn-primary flex items-center gap-1">
                      <Mail className="h-4 w-4" /> Messages
                    </Link>
                    <Link to={`/admin/tasks/${user._id}`} className="btn btn-sm btn-accent flex items-center gap-1">
                      <ClipboardList className="h-4 w-4" /> Tasks
                    </Link>
                    <Link to={`/admin/memos/${user._id}`} className="btn btn-sm btn-secondary flex items-center gap-1">
                      <FileText className="h-4 w-4" /> Memos
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
