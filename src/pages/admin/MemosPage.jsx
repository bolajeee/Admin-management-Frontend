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
import toast from 'react-hot-toast';
import { CheckCircle, Clock, Trash2, Info, XCircle } from 'lucide-react';
import UserAvatar from '../../components/ui/UserAvatar';
// Simple date formatting helper
function formatDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
}

// Add a simple modal for snoozing memos
function SnoozeModal({ show, onClose, onSnooze, snoozing, defaultDuration = 15 }) {
  const [duration, setDuration] = useState(defaultDuration);
  const [comments, setComments] = useState('');
  useEffect(() => {
    if (show) {
      setDuration(defaultDuration);
      setComments('');
    }
  }, [show, defaultDuration]);
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-xs flex flex-col gap-4">
        <h2 className="text-lg font-bold">Snooze Memo</h2>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Duration (minutes)</span>
          <input type="number" min={1} max={240} value={duration} onChange={e => setDuration(Number(e.target.value))} className="input input-bordered" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Comments (optional)</span>
          <textarea value={comments} onChange={e => setComments(e.target.value)} className="textarea textarea-bordered" />
        </label>
        <div className="flex gap-2 justify-end">
          <button className="btn btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" disabled={snoozing} onClick={() => onSnooze(duration, comments)}>
            {snoozing ? 'Snoozing...' : 'Snooze'}
          </button>
        </div>
      </div>
    </div>
  );
}

const getMemoStatusProps = (memo, snoozeAck) => {
  // If snoozed and snooze not expired, show as snoozed
  if (snoozeAck && snoozeAck.snoozedUntil && new Date(snoozeAck.snoozedUntil) > new Date()) {
    return {
      border: 'border-yellow-400',
      bg: 'bg-yellow-50 opacity-70',
      icon: <Clock className="text-yellow-500 w-4 h-4" />,
      label: 'Snoozed',
      text: 'text-yellow-700',
      faded: true,
      snoozedUntil: snoozeAck.snoozedUntil,
    };
  }
  switch (memo.status) {
    case 'active':
      return {
        border: 'border-green-400',
        bg: 'bg-green-50',
        icon: <CheckCircle className="text-green-500 w-4 h-4" />,
        label: 'Active',
        text: 'text-green-700',
        faded: false,
      };
    case 'deleted':
      return {
        border: 'border-red-400',
        bg: 'bg-red-50 opacity-60',
        icon: <Trash2 className="text-red-500 w-4 h-4" />,
        label: 'Deleted',
        text: 'text-red-700',
        faded: true,
      };
    case 'expired':
      return {
        border: 'border-gray-400',
        bg: 'bg-gray-50 opacity-70',
        icon: <Info className="text-gray-500 w-4 h-4" />,
        label: 'Expired',
        text: 'text-gray-700',
        faded: true,
      };
    case 'cancelled':
      return {
        border: 'border-yellow-400',
        bg: 'bg-yellow-50 opacity-70',
        icon: <XCircle className="text-yellow-500 w-4 h-4" />,
        label: 'Cancelled',
        text: 'text-yellow-700',
        faded: true,
      };
    default:
      return {
        border: 'border-base-300',
        bg: 'bg-base-200',
        icon: null,
        label: memo.status,
        text: 'text-base-content',
        faded: false,
      };
  }
};


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
  const { markMemoAsRead, deleteMemo, deleteMemoGlobal, memoActionLoading, sendCompanyWideMemo } = useMemoStore();


  const authUser = useAuthStore((state) => state.authUser);

  const { id } = useParams();
  const navigate = useNavigate();

  const [showMemoModal, setShowMemoModal] = useState(false);
  const [memoTitle, setMemoTitle] = useState("");
  const [memoText, setMemoText] = useState("");
  const [sendingMemo, setSendingMemo] = useState(false);
  const usersCount = users.length;
  const [acknowledgedMemos, setAcknowledgedMemos] = useState([]);


  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [snoozingMemoId, setSnoozingMemoId] = useState(null);
  const [snoozing, setSnoozing] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState({}); // { [memoId]: bool }
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetMemoId, setDeleteTargetMemoId] = useState(null);

  const handleSnooze = async (memoId, duration, comments) => {
    setSnoozing(true);
    try {
      await axiosInstance.patch(`/memos/${memoId}/snooze`, { durationMinutes: duration, comments });
      setShowSnoozeModal(false);
      setSnoozingMemoId(null);
      getMemos();
      toast.success('Memo snoozed!');
    } catch (e) {
      toast.error('Failed to snooze memo.');
    } finally {
      setSnoozing(false);
    }
  };

  const handleStatusChange = async (memoId, newStatus) => {
    setStatusUpdating(s => ({ ...s, [memoId]: true }));
    try {
      await axiosInstance.put(`/memos/${memoId}`, { status: newStatus });
      getMemos();
      toast.success('Memo status updated!');
    } catch (e) {
      toast.error('Failed to update status.');
    } finally {
      setStatusUpdating(s => ({ ...s, [memoId]: false }));
    }
  };


  const handleOpenDeleteModal = (memoId) => {
    setDeleteTargetMemoId(memoId);
    setShowDeleteModal(true);
  };

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
        <div className="flex flex-col w-6xl max-w-6xl h-full border-t border-base-300 bg-base-100 rounded-xl shadow-xl transition-all duration-300">
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
            memoTitle={memoTitle}
            setMemoTitle={setMemoTitle}
            memoText={memoText}
            setMemoText={setMemoText}
            sendingMemo={sendingMemo}
            onSendMemo={async () => {
              setSendingMemo(true);
              try {
                await sendCompanyWideMemo({
                  title: memoTitle,
                  content: memoText,
                  recipients: [selectedUser._id],
                });
                setShowMemoModal(false);
                setMemoTitle("");
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
                {userMemos.map((memo) => {
                  const snoozeAck = memo.acknowledgments && memo.acknowledgments.find(a => a.user === selectedUser._id && a.status === 'snoozed');
                  const statusProps = getMemoStatusProps(memo, snoozeAck);
                  const isDeleted = memo.status === 'deleted';
                  return (
                    <li key={memo.id} className={`p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow flex flex-col gap-1 ${statusProps.bg} ${statusProps.border} ${statusProps.faded ? 'opacity-60' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {statusProps.icon}
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${statusProps.text} ${statusProps.border} bg-white/70`}>{statusProps.label}</span>
                        <span className="text-xs text-base-content/60">{formatDate(memo.createdAt)}</span>
                        {statusProps.label === 'Snoozed' && snoozeAck && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Snoozed until {formatDate(snoozeAck.snoozedUntil)}
                          </span>
                        )}
                      </div>
                      <div className={`font-semibold text-lg ${statusProps.text}`}>{memo.title}</div>
                      <div className={`text-sm mb-1 ${statusProps.text}`}>{memo.content}</div>
                    </li>
                  );
                })}
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
        memoTitle={memoTitle}
        setMemoTitle={setMemoTitle}
        memoText={memoText}
        setMemoText={setMemoText}
        sendingMemo={sendingMemo}
        onSendMemo={async () => {
          setSendingMemo(true);
          try {
            await sendCompanyWideMemo({
              title: memoTitle,
              content: memoText,
            });
            setShowMemoModal(false);
            setMemoTitle("");
            setMemoText("");
            getMemos();
            getUserMemos(authUser?._id);
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
              {companyMemos.map((memo) => {
                const isAcknowledged = acknowledgedMemos.includes(memo.id) || (memo.acknowledgments && memo.acknowledgments.some(a => a.user === authUser?._id && a.status === 'acknowledged'));
                const isCreator = authUser && memo.createdBy && (memo.createdBy._id === authUser._id || memo.createdBy === authUser._id);
                const snoozeAck = memo.acknowledgments && memo.acknowledgments.find(a => a.user === authUser?._id && a.status === 'snoozed');
                const statusProps = getMemoStatusProps(memo, snoozeAck);
                const isDeleted = memo.status === 'deleted';
                return (
                  <li key={memo.id} className={`p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow flex flex-col gap-1 ${statusProps.bg} ${statusProps.border} ${isDeleted ? 'opacity-60 pointer-events-none' : ''}`}>
                    <div className="flex items-center gap-3 mb-1">
                      {memo.createdBy && (
                        <UserAvatar user={typeof memo.createdBy === 'object' ? memo.createdBy : users.find(u => u._id === memo.createdBy)} size="w-8 h-8" textSize="text-xs" showTooltip={true} />
                      )}
                      <span className="font-semibold text-base-content text-base">{(memo.createdBy && (memo.createdBy.name || memo.createdBy.email)) || 'System'}</span>
                      {statusProps.icon}
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${statusProps.text} ${statusProps.border} bg-white/70`}>{statusProps.label}</span>
                      <span className="text-xs text-base-content/60">{formatDate(memo.createdAt)}</span>
                      {statusProps.label === 'Snoozed' && snoozeAck && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Snoozed until {formatDate(snoozeAck.snoozedUntil)}
                        </span>
                      )}
                      {isAcknowledged && statusProps.label !== 'Snoozed' ? (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">Read</span>
                      ) : !isDeleted && (
                        <button
                          className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition disabled:opacity-50"
                          onClick={() => markMemoAsRead(memo.id, authUser?._id)}
                          disabled={memoActionLoading[memo.id]}
                        >
                          {memoActionLoading[memo.id] ? '...' : 'Mark as Read'}
                        </button>
                      )}
                      {!isDeleted && (
                        <button
                          className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200 transition disabled:opacity-50"
                          onClick={() => { setShowSnoozeModal(true); setSnoozingMemoId(memo.id); }}
                          disabled={snoozing}
                        >
                          {snoozing ? '...' : 'Snooze'}
                        </button>
                      )}
                      {isCreator && !isDeleted && (
                        <>
                          <button
                            className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/20 hover:bg-error/20 transition disabled:opacity-50"
                            onClick={() => handleOpenDeleteModal(memo.id)}
                            disabled={memoActionLoading[memo.id]}
                          >
                            Delete
                          </button>
                          <select
                            className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold border border-base-300 bg-base-100 disabled:opacity-50"
                            value={memo.status}
                            disabled={statusUpdating[memo.id]}
                            onChange={e => handleStatusChange(memo.id, e.target.value)}
                          >
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="deleted">Deleted</option>
                          </select>
                        </>
                      )}
                    </div>
                    <div className={`font-semibold text-lg ${statusProps.text}`}>{memo.title}</div>
                    <div className={`text-sm mb-1 ${statusProps.text}`}>{memo.content}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* My Memos section */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle>My Memos</CardTitle>
        </CardHeader>
        <CardContent>
          {isMemosLoading ? (
            <div className="text-base-content/70">Loading memos...</div>
          ) : userMemosList.length === 0 ? (
            <p className="text-base-content/70">No memos assigned to you.</p>
          ) : (
            <ul className="space-y-3">
              {userMemosList.map((memo) => {
                const isAcknowledged = memo.acknowledgments && memo.acknowledgments.some(a => a.user === authUser?._id && a.status === 'acknowledged');
                const isCreator = authUser && memo.createdBy && (memo.createdBy._id === authUser._id || memo.createdBy === authUser._id);
                const snoozeAck = memo.acknowledgments && memo.acknowledgments.find(a => a.user === authUser?._id && a.status === 'snoozed');
                const statusProps = getMemoStatusProps(memo, snoozeAck);
                return (
                  <li key={memo.id} className={`p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow flex flex-col gap-1 ${statusProps.bg} ${statusProps.border} ${statusProps.faded ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-3 mb-1">
                      {memo.createdBy && (
                        <UserAvatar user={typeof memo.createdBy === 'object' ? memo.createdBy : users.find(u => u._id === memo.createdBy)} size="w-8 h-8" textSize="text-xs" showTooltip={true} />
                      )}
                      <span className="font-semibold text-base-content text-base">{(memo.createdBy && (memo.createdBy.name || memo.createdBy.email)) || 'System'}</span>
                      {statusProps.icon}
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${statusProps.text} ${statusProps.border} bg-white/70`}>{statusProps.label}</span>
                      <span className="text-xs text-base-content/60">{formatDate(memo.createdAt)}</span>
                      {statusProps.label === 'Snoozed' && snoozeAck && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Snoozed until {formatDate(snoozeAck.snoozedUntil)}
                        </span>
                      )}
                      {isAcknowledged ? (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">Read</span>
                      ) : (
                        <button
                          className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition"
                          onClick={() => markMemoAsRead(memo.id, authUser?._id)}
                        >
                          Mark as Read
                        </button>
                      )}
                      {isCreator && (
                        <button
                          className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/20 hover:bg-error/20 transition"
                          onClick={() => handleOpenDeleteModal(memo.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <div className="font-semibold text-base-content text-lg">{memo.title}</div>
                    <div className="text-sm text-base-content/80 mb-1">{memo.content}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* User-specific memos for the logged-in admin */}
      {userMemosList.length > 0 && (
        <Card className="mb-10">
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
                  <div key={user._id} className="flex flex-col gap-2 p-5 rounded-xl bg-base-100 border border-base-300 shadow-md transition-all duration-300 hover:shadow-2xl hover:-rotate-2 hover:scale-[1.025] hover:z-10 cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <UserAvatar user={user} size="w-10 h-10" textSize="text-base" showTooltip={true} />
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
      )}
      <SnoozeModal
        show={showSnoozeModal}
        onClose={() => { setShowSnoozeModal(false); setSnoozingMemoId(null); }}
        onSnooze={(duration, comments) => handleSnooze(snoozingMemoId, duration, comments)}
        snoozing={snoozing}
      />
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-base-100 p-6 rounded-xl shadow-lg w-[90%] max-w-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold">Delete Memo</h2>
            <p>Do you want to delete this memo for everyone or only for you?</p>
            <div className="flex gap-2 justify-end">
              <button
                className="btn btn-error"
                onClick={() => {
                  deleteMemoGlobal(deleteTargetMemoId, authUser?._id).then(() => {
                    getMemos();
                    if (authUser?._id) getUserMemos(authUser._id);
                  });
                  setShowDeleteModal(false);
                  setDeleteTargetMemoId(null);
                }}
              >
                Delete for everyone
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  deleteMemo(deleteTargetMemoId, authUser?._id).then(() => {
                    getMemos();
                    if (authUser?._id) getUserMemos(authUser._id);
                  });
                  setShowDeleteModal(false);
                  setDeleteTargetMemoId(null);
                }}
              >
                Delete for only me
              </button>
              <button
                className="btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTargetMemoId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
