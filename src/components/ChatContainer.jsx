import React, { useEffect, useRef } from 'react'
import MessageInput from './MessageInput'
import ChatHeader from './ChatHeader'
import { useChatStore } from '../store/useChatStore.js'
import { useAuthStore } from '../store/useAuthStore.js'
import { useThemeStore } from '../store/useThemeStore.js'
const ChatContainer = () => {
  const { getMessages, isMessagesLoading, selectedUser, messages, sendMessage } = useChatStore()
  const authUser = useAuthStore((state) => state.authUser);
  const { theme } = useThemeStore();
  const messagesEndRef = useRef(null)

  // Debug: Log messages array
  console.log('Messages in ChatContainer:', messages)

  // Use the correct array for rendering
  const messageArray = Array.isArray(messages) ? messages : messages.messages || [];

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id)
    }
  }, [selectedUser?._id, getMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  if (!selectedUser) {
    return (
      <div className='flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400'>
        <p>Select a user to start chatting</p>
      </div>
    )
  }

  if (isMessagesLoading) return <div className='flex-1 flex items-center justify-center'>
    <p className='text-sm text-gray-500'>Loading messages...</p>
  </div>

  // Helper to get a single image URL from possible fields
  const getSingleImageUrl = (msg) => {
    if (msg.image && typeof msg.image === 'string' && msg.image.trim() && msg.image !== 'null' && msg.image !== 'undefined') return msg.image;
    if (msg.imageUrl && typeof msg.imageUrl === 'string' && msg.imageUrl.trim() && msg.imageUrl !== 'null' && msg.imageUrl !== 'undefined') return msg.imageUrl;
    if (Array.isArray(msg.image) && msg.image[0] && typeof msg.image[0] === 'string' && msg.image[0].trim() && msg.image[0] !== 'null' && msg.image[0] !== 'undefined') return msg.image[0];
    if (Array.isArray(msg.imageUrl) && msg.imageUrl[0] && typeof msg.imageUrl[0] === 'string' && msg.imageUrl[0].trim() && msg.imageUrl[0] !== 'null' && msg.imageUrl[0] !== 'undefined') return msg.imageUrl[0];
    if (Array.isArray(msg.imageUrls) && msg.imageUrls[0] && typeof msg.imageUrls[0] === 'string' && msg.imageUrls[0].trim() && msg.imageUrls[0] !== 'null' && msg.imageUrls[0] !== 'undefined') return msg.imageUrls[0];
    if (msg.imageUrls && typeof msg.imageUrls === 'string' && msg.imageUrls.trim() && msg.imageUrls !== 'null' && msg.imageUrls !== 'undefined') return msg.imageUrls;
    return null;
  };

  return (
    <div className={`flex-1 flex flex-col overflow-auto rounded-lg shadow-md ${theme === 'dark' ? 'bg-base-200' : 'bg-base-100'}`}>
      <ChatHeader />
      <div className='flex-1 overflow-y-auto px-2 sm:px-4 py-2 space-y-6 bg-gradient-to-b from-base-100 via-base-200 to-base-100 dark:from-base-200 dark:via-base-300 dark:to-base-200'>
       {messageArray.length > 0 ? (
  messageArray.map((msg, idx) => {
    const isOwn = msg.sender === authUser?._id || msg.senderId === authUser?._id;
    const imageUrl = getSingleImageUrl(msg);

    return (
      <div
        key={msg._id || idx}
        className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} group`}
      >
        {/* Avatar Left */}
        {!isOwn && (
          <div className='flex flex-col items-center mr-3'>
            <img
              src={msg.senderAvatar || '/avatar.png'}
              alt='avatar'
              className='w-9 h-9 rounded-full border-2 border-base-300 shadow-md transition-transform group-hover:scale-105'
            />
          </div>
        )}

        {/* Message Bubble */}
        <div className={`max-w-[75%] sm:max-w-[65%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          <div
            className={`rounded-2xl px-5 py-3 shadow-md break-words whitespace-pre-wrap border ${isOwn
              ? theme === 'dark'
                ? 'bg-primary text-primary-content border-primary/60'
                : 'bg-primary text-primary-content border-primary/60'
              : theme === 'dark'
                ? 'bg-base-300 text-base-content border-base-400'
                : 'bg-base-200 text-base-content border-base-300'
              } transition-all duration-200`}
          >
            {msg.text && <span className='block text-sm sm:text-base leading-relaxed'>{msg.text}</span>}
            {imageUrl && (
              <img
                src={imageUrl}
                alt="attachment"
                className="mt-3 max-w-xs max-h-56 rounded-lg border border-base-300 shadow object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>

          {/* Timestamp and Sender */}
          <div className={`flex gap-3 text-xs mt-2 ${isOwn ? 'justify-end' : 'justify-start'} w-full`}>
            <span className={`${isOwn ? 'text-primary/70' : 'text-base-content/70'}`}>
              {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
            <span className={`${isOwn ? 'text-primary font-semibold' : 'text-gray-500 dark:text-gray-400 font-medium'}`}>
              {isOwn ? 'You' : msg.senderName || 'User'}
            </span>
          </div>
        </div>

        {/* Avatar Right */}
        {isOwn && (
          <div className='flex flex-col items-center ml-3'>
            <img
              src={msg.senderAvatar || '/avatar.png'}
              alt='avatar'
              className='w-9 h-9 rounded-full border-2 border-primary shadow-md transition-transform group-hover:scale-105'
            />
          </div>
        )}
      </div>
    );
  })
) : (
  <div className='text-center text-gray-400 py-8'>No messages yet. Start the conversation!</div>
)}



        <div ref={messagesEndRef} />

      </div>
      <div className={`border-t p-2 ${theme === 'dark' ? 'border-base-300 bg-base-200' : 'border-base-200 bg-base-100'}`}>
        <MessageInput
          onSend={({ text, image }) => {
            if (!selectedUser?._id) return;
            sendMessage({ receiverId: selectedUser._id, text, image });
          }}
          loading={isMessagesLoading}
        />
      </div>
    </div>
  )
}

export default ChatContainer