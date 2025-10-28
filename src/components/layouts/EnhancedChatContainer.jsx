import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  Search,
  Star,
  Archive,
  Trash2,
  Image,
  File,
  Mic,
  MicOff,
  Check,
  CheckCheck,
  Clock,
  Reply,
  Forward,
  Copy
} from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import UserAvatar from "../ui/UserAvatar";
import toast from "react-hot-toast";

const EnhancedChatContainer = () => {
  const { selectedUser, messages, sendMessage, getMessages, isMessagesLoading } = useChatStore();
  const { authUser } = useAuthStore();
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await sendMessage({ 
        receiverId: selectedUser._id, 
        text: newMessage.trim() 
      });
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload logic
      toast.info("File upload functionality coming soon");
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info("Voice recording functionality coming soon");
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getMessageStatus = (message) => {
    if (message.senderId === authUser._id) {
      switch (message.status) {
        case "sent":
          return <Check className="h-3 w-3 text-base-content/40" />;
        case "delivered":
          return <CheckCheck className="h-3 w-3 text-base-content/40" />;
        case "read":
          return <CheckCheck className="h-3 w-3 text-primary" />;
        default:
          return <Clock className="h-3 w-3 text-base-content/40" />;
      }
    }
    return null;
  };

  const displayMessages = messages || [];

  return (
    <div className="flex-1 flex flex-col bg-base-100">
      {/* Chat Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 border-b border-base-300 bg-base-50/50 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar user={selectedUser} size="w-10 h-10" />
            <div>
              <h3 className="font-semibold text-base-content">
                {selectedUser?.name || selectedUser?.email}
              </h3>
              <p className="text-sm text-base-content/60">
                {selectedUser?.isOnline ? (
                  <span className="text-success">Online</span>
                ) : (
                  "Last seen recently"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUserInfo(!showUserInfo)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <Info className="h-4 w-4" />
            </button>
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
                <MoreVertical className="h-4 w-4" />
              </button>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                <li><button><Star className="h-4 w-4" />Star Conversation</button></li>
                <li><button><Archive className="h-4 w-4" />Archive Chat</button></li>
                <li><button className="text-error"><Trash2 className="h-4 w-4" />Delete Conversation</button></li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-base-100 to-base-200/30">
        {isMessagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        ) : (
          <AnimatePresence>
            {displayMessages.map((message, index) => {
              const isOwn = message.sender?._id === authUser._id || message.senderId === authUser._id;
              const showAvatar = index === 0 || 
                (displayMessages[index - 1].sender?._id || displayMessages[index - 1].senderId) !== 
                (message.sender?._id || message.senderId);
              const showTime = index === displayMessages.length - 1 || 
                displayMessages[index + 1].senderId !== message.senderId ||
                new Date(displayMessages[index + 1].createdAt) - new Date(message.createdAt) > 300000; // 5 minutes

              return (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-3 ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  {!isOwn && showAvatar && (
                    <UserAvatar user={selectedUser} size="w-8 h-8" className="mt-auto" />
                  )}
                  {!isOwn && !showAvatar && <div className="w-8"></div>}

                  <div className={`max-w-xs lg:max-w-md ${isOwn ? "order-1" : ""}`}>
                    <div
                      className={`group relative px-4 py-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                        isOwn
                          ? "bg-primary text-primary-content ml-auto"
                          : "bg-base-200 text-base-content hover:bg-base-300"
                      }`}
                      onClick={() => setSelectedMessage(selectedMessage === message._id ? null : message._id)}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                      
                      {/* Message Actions */}
                      <AnimatePresence>
                        {selectedMessage === message._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-base-100 rounded-lg shadow-lg border border-base-300 flex items-center gap-1 p-1"
                          >
                            <button className="btn btn-ghost btn-xs btn-circle">
                              <Reply className="h-3 w-3" />
                            </button>
                            <button className="btn btn-ghost btn-xs btn-circle">
                              <Forward className="h-3 w-3" />
                            </button>
                            <button className="btn btn-ghost btn-xs btn-circle">
                              <Copy className="h-3 w-3" />
                            </button>
                            {isOwn && (
                              <button className="btn btn-ghost btn-xs btn-circle text-error">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {showTime && (
                      <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                        <span className="text-xs text-base-content/50">
                          {formatMessageTime(message.createdAt)}
                        </span>
                        {getMessageStatus(message)}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <UserAvatar user={selectedUser} size="w-8 h-8" />
            <div className="bg-base-200 rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 border-t border-base-300 bg-base-50/50 backdrop-blur-sm"
      >
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          {/* Attachment Button */}
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle"
            >
              <Image className="h-4 w-4" />
            </button>
          </div>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="textarea textarea-bordered w-full resize-none pr-12"
              rows="1"
              style={{ minHeight: "2.5rem", maxHeight: "8rem" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
            >
              <Smile className="h-4 w-4" />
            </button>
          </div>

          {/* Voice/Send Button */}
          <div className="flex items-center gap-1">
            {newMessage.trim() ? (
              <button
                type="submit"
                className="btn btn-primary btn-circle"
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleVoiceRecord}
                className={`btn btn-circle ${isRecording ? "btn-error" : "btn-ghost"}`}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}
          </div>
        </form>


      </motion.div>
    </div>
  );
};

export default EnhancedChatContainer;