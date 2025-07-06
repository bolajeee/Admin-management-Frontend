import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { FileText, User } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { Link } from 'react-router-dom';
import { useChatStore } from '../../store/useChatStore';
import { useMemoStore } from '../../store/useMemoStore';

export default function MessagesPage() {
  const { theme } = useThemeStore();

  const users = useChatStore((state) => state.users);
  const isUsersLoading = useChatStore((state) => state.isUsersLoading);

  const memos = useMemoStore((state) => state.memos);
  const isMemosLoading = useMemoStore((state) => state.isMemosLoading);
  const getMemos = useMemoStore.getState().getMemos;

  useEffect(() => {
    useChatStore.getState().getUsers();
    getMemos();
  }, []);

  return (
    <div data-theme={theme}>
      <h1 className="text-2xl font-bold mb-8 pt-[70px] text-primary">Memos</h1>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Company-wide Memos</CardTitle>
        </CardHeader>
        <CardContent>
          {isMemosLoading ? (
            <div className="text-base-content/70">Loading memos...</div>
          ) : memos.length === 0 ? (
            <p className="text-base-content/70">No memos available.</p>
          ) : (
            <ul className="space-y-3">
              {memos.map((memo) => (
                <li key={memo._id} className="p-4 rounded-lg bg-base-200 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
                  <div className="font-semibold text-base-content text-lg mb-1">{memo.title}</div>
                  <div className="text-sm text-base-content/80 mb-2">{memo.content}</div>
                  <div className="text-xs text-base-content/60">{memo.date ? new Date(memo.date).toLocaleString() : ''}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

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
                    <Link to={`/admin/memos/${user._id}`} className="btn btn-sm btn-secondary flex items-center gap-1 rounded-full px-4 py-2 text-base-content font-medium shadow hover:shadow-md">
                      <FileText className="h-4 w-4" /> View Memos
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
