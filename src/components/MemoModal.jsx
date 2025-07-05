import React from "react";

const MemoModal = ({
    show,
    onClose,
    memoText,
    setMemoText,
    sendingMemo,
    onSendMemo
}) => {
    const textareaRef = React.useRef(null);

    React.useEffect(() => {
        if (show && textareaRef.current) {
            const len = memoText.length;
            textareaRef.current.setSelectionRange(len, len);
            textareaRef.current.focus();
        }
    }, [show, memoText]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-base-100 rounded-xl shadow-2xl p-6 w-full max-w-md relative animate-fade-in">
                <button
                    className="absolute top-3 right-3 btn btn-sm btn-circle btn-ghost"
                    onClick={onClose}
                    disabled={sendingMemo}
                    aria-label="Close"
                    type="button"
                >
                    <span aria-hidden="true">&times;</span>
                </button>
                <h2 className="text-xl font-bold mb-4 text-center">Send Company-wide Memo</h2>
                <textarea
                    ref={textareaRef}
                    className="textarea textarea-bordered w-full mb-4 text-left resize-none min-h-[100px]"
                    rows={4}
                    placeholder="Type your memo here..."
                    value={memoText}
                    onChange={e => setMemoText(e.target.value)}
                    autoFocus
                    dir="ltr"
                />
                <div className="flex justify-end gap-2 mt-2">
                    <button
                        className="btn btn-ghost"
                        onClick={onClose}
                        disabled={sendingMemo}
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        disabled={sendingMemo || !memoText.trim()}
                        onClick={onSendMemo}
                        type="button"
                    >
                        {sendingMemo ? 'Sending...' : 'Send Memo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemoModal;
