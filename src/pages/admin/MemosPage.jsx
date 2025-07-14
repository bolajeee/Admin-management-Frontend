import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { FileText, User } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { Link } from 'react-router-dom';
import { useChatStore } from '../../store/useChatStore';
import { useMemoStore } from '../../store/useMemoStore';
import MemoModal from '../../components/modals/MemoModal';
import { axiosInstance } from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';
// Simple date formatting helper
function formatDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
}


export default function MemosPage() {
  const { theme } = useThemeStore();

  const users = useChatStore((state) => state.users);
  const isUsersLoading = useChatStore((state) => state.isUsersLoading);

  const memos = useMemoStore((state) => state.memos);
  const isMemosLoading = useMemoStore((state) => state.isMemosLoading);
  const userMemos = useMemoStore((state) => state.userMemos);
  const isUserMemosLoading = useMemoStore((state) => state.isUserMemosLoading);
  const getMemos = useMemoStore.getState().getMemos;
  const getUserMemos = useMemoStore.getState().getUserMemos;

  const authUser = useAuthStore((state) => state.authUser);

  const { id } = useParams();
  const navigate = useNavigate();

  const [showMemoModal, setShowMemoModal] = useState(false);
  const [memoText, setMemoText] = useState('');
  const [sendingMemo, setSendingMemo] = useState(false);
  const usersCount = users.length;

  useEffect(() => {
    useChatStore.getState().getUsers();
    getMemos();
  }, []);

  // Fetch user memos if id is present
  useEffect(() => {
    if (id) {
      getUserMemos(id);
    }
  }, [id, getUserMemos]);

  // Find the selected user if id is present
  const selectedUser = id ? users.find((u) => u._id === id) : null;

  // Only memos sent to all users (company-wide): every user._id is in memo.recipients
  const companyMemos = memos.filter(memo => {
    if (!Array.isArray(memo.recipients) || users.length === 0) return false;
    const recipientIds = memo.recipients.map(r => typeof r === 'string' ? r : r._id);
    return users.every(u => recipientIds.includes(u._id));
  });

  // User-specific memos for the logged-in admin
  const userMemosList = memos.filter(memo => {
    if (!Array.isArray(memo.recipients) || !authUser) return false;
    const recipientIds = memo.recipients.map(r => typeof r === 'string' ? r : r._id);
    return recipientIds.includes(authUser._id) && !companyMemos.includes(memo);
  });


  // If a user is selected, show their memos in a panel
  if (id && selectedUser) {
    return (
      <div data-theme={theme} className="h-[calc(100vh-4rem)] w-full flex justify-center items-center">
        <div className="flex flex-col w-full max-w-2xl h-full border-t border-base-300 bg-base-100 rounded-xl shadow-xl transition-all duration-300">
          {/* Header with Cancel Button and Send Memo */}
          <div className="px-4 py-2 border-b border-base-300 bg-base-100/80 rounded-t-xl shadow-sm flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                className="btn btn-sm border font-medium rounded-full px-4 py-1 shadow-md transition-all duration-200 hover:bg-base-200"
                onClick={() => navigate('/admin/memos')}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary px-4 py-1 rounded-full shadow font-medium"
                onClick={() => setShowMemoModal(true)}
              >
                Send Memo
              </button>
            </div>
            <span className="font-semibold text-lg text-primary">{selectedUser.name || selectedUser.email}'s Memos</span>
          </div>
          <MemoModal
            show={showMemoModal}
            onClose={() => setShowMemoModal(false)}
            memoText={memoText}
            setMemoText={setMemoText}
            sendingMemo={sendingMemo}
            onSendMemo={async () => {
              setSendingMemo(true);
              try {
                await axiosInstance.post('/memos', {
                  title: memoText.substring(0, 20),
                  content: memoText,
                  recipients: [selectedUser._id],
                });
                setShowMemoModal(false);
                setMemoText("");
                getUserMemos(selectedUser._id);
              } catch {
                // error handled in modal
              } finally {
                setSendingMemo(false);
              }
            }}
          />
          <div className="flex-1 min-h-0 h-0 overflow-y-auto px-4 pb-4 pt-2">
            {isUserMemosLoading ? (
              <div className="text-base-content/70">Loading memos...</div>
            ) : userMemos.length === 0 ? (
              <p className="text-base-content/70">No memos for this user.</p>
            ) : (
              <ul className="space-y-3">
                {userMemos.map((memo) => (
                  <li key={memo._id} className="p-4 rounded-lg bg-base-200 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
                    <div className="font-semibold text-base-content text-lg mb-1">{memo.title}</div>
                    <div className="text-sm text-base-content/80 mb-2">{memo.content}</div>
                    <div className="text-xs text-base-content/60">{formatDate(memo.date)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, show company-wide memos and user list
  return (
    <div data-theme={theme}>
      <div className="flex items-center justify-between mb-6 pt-[70px]">
        <h1 className="text-2xl font-bold text-primary">Memos</h1>
        <button
          className="btn btn-primary px-6 py-2 rounded-full shadow font-medium"
          onClick={() => setShowMemoModal(true)}
        >
          Send Company Memo
        </button>
      </div>

      <MemoModal
        show={showMemoModal}
        onClose={() => setShowMemoModal(false)}
        memoText={memoText}
        setMemoText={setMemoText}
        sendingMemo={sendingMemo}
        onSendMemo={async () => {
          setSendingMemo(true);
          try {
            await axiosInstance.post('/memos/broadcast', {
              title: memoText.substring(0, 20),
              content: memoText,
            });
            setShowMemoModal(false);
            setMemoText("");
            getMemos();
          } catch {
            // error handled in modal
          } finally {
            setSendingMemo(false);
          }
        }}
      />

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Company-wide Memos</CardTitle>
        </CardHeader>
        <CardContent>
          {isMemosLoading ? (
            <div className="text-base-content/70">Loading memos...</div>
          ) : companyMemos.length === 0 ? (
            <p className="text-base-content/70">No memos available.</p>
          ) : (
            <ul className="space-y-3">
              {companyMemos.map((memo) => (
                <li key={memo._id} className="p-4 rounded-lg bg-base-200 border border-base-300 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">All</span>
                    <span className="text-xs text-base-content/60">{formatDate(memo.createdAt)}</span>
                  </div>
                  <div className="font-semibold text-base-content text-lg">{memo.title}</div>
                  <div className="text-sm text-base-content/80 mb-1">{memo.content}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* User-specific memos for the logged-in admin */}
      {userMemosList.length > 0 && (
        <Card className="mb-10">
          <CardHeader>
            <CardTitle>Your Memos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {userMemosList.map((memo) => (
                <li key={memo._id} className="p-4 rounded-lg bg-base-200 border border-base-300 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20">User</span>
                    <span className="text-xs text-base-content/60">{formatDate(memo.createdAt)}</span>
                  </div>
                  <div className="font-semibold text-base-content text-lg">{memo.title}</div>
                  <div className="text-sm text-base-content/80 mb-1">{memo.content}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

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
