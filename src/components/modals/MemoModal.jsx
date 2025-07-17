import React from 'react';

export default function MemoModal({
  show,
  onClose,
  memoTitle,
  setMemoTitle,
  memoText,
  setMemoText,
  onSendMemo,
  sendingMemo
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-base-100 p-6 rounded-xl shadow-lg w-[90%] max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Send Company Memo</h2>
        <input
          type="text"
          value={memoTitle}
          onChange={e => setMemoTitle(e.target.value)}
          placeholder="Memo title..."
          className="w-full p-3 border rounded-md mb-3 bg-base-200 text-base-content"
        />
        <textarea
          value={memoText}
          onChange={(e) => setMemoText(e.target.value)}
          placeholder="Write your memo here..."
          rows={6}
          className="w-full p-3 border rounded-md resize-none bg-base-200 text-base-content"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-base-300 bg-base-300 text-base-content text-sm font-medium transition-colors hover:bg-base-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSendMemo}
            disabled={sendingMemo || memoTitle.trim() === '' || memoText.trim() === ''}
            className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {sendingMemo ? 'Sending...' : 'Send Memo'}
          </button>
        </div>
      </div>
    </div>
  );
}
