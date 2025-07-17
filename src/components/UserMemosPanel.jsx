import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useMemoStore } from '../store/useMemoStore';
import { ScrollText, Loader2, CheckCircle, Clock, Trash2, Info, XCircle } from 'lucide-react';


function formatDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
}

export default function UserMemosPanel() {
  const { getUserMemos, userMemos, isUserMemosLoading, markMemoAsRead, deleteMemo, memoActionLoading } = useMemoStore();
  const { authUser } = useAuthStore();
  const userId = authUser?._id;

  useEffect(() => {
    if (userId) getUserMemos(userId);
  }, [userId, getUserMemos]);

  // Filter out deleted memos
  const filteredMemos = (userMemos || []).filter(memo => memo.status !== 'deleted');

  // Move getMemoStatusProps inside the component
  const getMemoStatusProps = (memo, snoozeAck) => {
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

  return (
    <div className="p-4 bg-base-100 dark:bg-base-200 flex-1 overflow-y-auto w-full max-w-md md:max-w-lg">
      <div className="flex items-center gap-2 mb-4 text-primary font-semibold">
        <ScrollText className="w-5 h-5" />
        <h2 className="text-lg">Memos</h2>
      </div>
      {isUserMemosLoading ? (
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : filteredMemos.length === 0 ? (
        <p className="text-sm text-gray-500">No memos for this user.</p>
      ) : (
        <ul className="space-y-3">
          {filteredMemos.map((memo) => {
            const isAcknowledged = memo.acknowledgments && memo.acknowledgments.some(a => a.user === userId && a.status === 'acknowledged');
            const snoozeAck = memo.acknowledgments && memo.acknowledgments.find(a => a.user === userId && a.status === 'snoozed');
            // If snoozed and snoozeUntil is in the future, show as snoozed, else show as active
            const statusProps = getMemoStatusProps(memo, snoozeAck);
            const isDeleted = memo.status === 'deleted';
            return (
              <li key={memo.id} className={`p-3 rounded-lg border shadow-sm flex flex-col gap-1 ${statusProps.bg} ${statusProps.border} ${statusProps.faded ? 'opacity-60' : ''}`}>
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
                  {isAcknowledged && statusProps.label !== 'Snoozed' ? (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">Read</span>
                  ) : !isDeleted && (
                    <button
                      className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition disabled:opacity-50"
                      onClick={() => markMemoAsRead(memo.id, userId)}
                      disabled={memoActionLoading[memo.id]}
                    >
                      {memoActionLoading[memo.id] ? '...' : 'Mark as Read'}
                    </button>
                  )}
                  {!isDeleted && (
                    <button
                      className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/20 hover:bg-error/20 transition disabled:opacity-50"
                      onClick={() => deleteMemo(memo.id, userId)}
                      disabled={memoActionLoading[memo.id]}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className={`font-semibold text-base-content text-lg ${statusProps.text}`}>{memo.title}</div>
                <div className={`text-sm text-base-content/80 mb-1 ${statusProps.text}`}>{memo.content}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
