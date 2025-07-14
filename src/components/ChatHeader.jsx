import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="px-6 py-3 bg-gradient-to-r from-base-100/90 to-base-200/90 border-b border-base-300 rounded-t-xl shadow flex items-center justify-between">
      {/* Avatar + Name/Status */}
      <button
        className="flex items-center gap-4 group focus:outline-none"
        onClick={() => setShowModal(true)}
        type="button"
      >
        <div className="relative">
          <img
            src={selectedUser.profilePicture || selectedUser.profilePic || "/avatar.png"}
            alt={selectedUser.name || selectedUser.email}
            className="w-12 h-12 rounded-full border-2 border-primary shadow group-hover:scale-105 transition"
          />
          <span
            className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 ${
              isOnline ? "bg-green-500 border-white" : "bg-gray-400 border-white"
            }`}
          />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-lg font-bold text-primary group-hover:underline">
            {selectedUser.name || selectedUser.email}
          </span>
          <span className="text-xs text-base-content/70 flex items-center gap-1">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            ></span>
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </button>

      {/* Close button */}
      <button
        onClick={() => setSelectedUser(null)}
        className="rounded-full hover:bg-error/10 text-error transition p-2 w-9 h-9 flex items-center justify-center shadow border border-transparent hover:border-error focus:outline-none focus-visible:ring-2 focus-visible:ring-error/40"
        title="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* User Info Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-base-100 border border-base-300 rounded-2xl p-6 max-w-xs w-full relative flex flex-col items-center shadow-2xl">
            <button
              className="absolute top-2 right-2 text-xl rounded-full hover:bg-base-200 transition p-1 w-8 h-8 flex items-center justify-center"
              onClick={() => setShowModal(false)}
              title="Close"
            >
              &times;
            </button>
            <img
              src={selectedUser.profilePicture || selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.name || selectedUser.email}
              className="w-24 h-24 rounded-full shadow-lg object-cover mb-4 border-4 border-base-200"
            />
            <h2 className="text-xl font-bold mb-1 text-center">{selectedUser.name || selectedUser.email}</h2>
            <p className="text-base-content/70 mb-1 text-center">{selectedUser.email}</p>
            <p className="text-sm text-base-content/60 text-center mb-2">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;