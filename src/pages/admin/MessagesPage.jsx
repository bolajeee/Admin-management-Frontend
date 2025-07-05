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
    isUsersLoading,
    getUsers,
    // Optionally: error states
  } = useChatStore();

  useEffect(() => {
    getUsers();
    // eslint-disable-next-line
  }, []);

  return (
    <div data-theme={theme}>
      <h1 className="text-2xl font-bold mb-8 pt-[70px] text-primary">Messages</h1>
      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isUsersLoading ? (
            <div className="text-base-content/70">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-base-content/70">No users found.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <div key={user._id} className="flex flex-col gap-2 p-5 rounded-xl bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-6 w-6 text-primary" />
                    <span className="font-semibold text-base-content text-lg">{user.name || user.email}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/admin/messages/${user._id}`} className="btn btn-sm btn-primary flex items-center gap-1 rounded-full px-4 py-2 text-base-content font-medium shadow hover:shadow-md">
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
