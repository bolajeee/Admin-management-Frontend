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

  return (
    <div className={`flex-1 flex flex-col overflow-auto rounded-lg shadow-md ${theme === 'dark' ? 'bg-base-200' : 'bg-base-100'}`}>
      <ChatHeader />
      <div className='flex-1 overflow-y-auto px-2 sm:px-4 py-2 space-y-6 bg-gradient-to-b from-base-100 via-base-200 to-base-100 dark:from-base-200 dark:via-base-300 dark:to-base-200'>
        {messageArray.length > 0 ? (
          messageArray.map((msg, idx) => {
            const isOwn = msg.sender === authUser?._id || msg.senderId === authUser?._id;

            return (
              <div
                key={msg._id || idx}
                className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} group`}
              >
                {!isOwn && (
                  <div className='flex flex-col items-center mr-2'>
                    <img
                      src={msg.senderAvatar || '/avatar.png'}
                      alt='avatar'
                      className='w-9 h-9 rounded-full border-2 border-base-300 shadow-md mb-1 transition-transform group-hover:scale-105'
                    />
                  </div>
                )}
                <div className={`max-w-[75%] sm:max-w-[60%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-3xl px-5 py-3 shadow-lg relative break-words whitespace-pre-wrap border ${
                      isOwn
                        ? theme === 'dark'
                          ? 'bg-primary text-primary-content border-primary/60'
                          : 'bg-primary text-primary-content border-primary/60'
                        : theme === 'dark'
                        ? 'bg-base-300 text-base-content border-base-400'
                        : 'bg-base-200 text-base-content border-base-300'
                    } transition-all duration-200`}
                  >
                    {msg.text && <span className='block text-base leading-relaxed'>{msg.text}</span>}
                    {msg.image && (
                      <img
                        src={msg.imageUrl}
                        alt='attachment'
                        className='mt-3 max-w-xs max-h-56 rounded-xl border border-base-300 shadow-md object-cover'
                      />
                    )}
                  </div>
                  <div className={`flex flex-row gap-2 items-center mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-xs opacity-70 ${isOwn ? 'text-primary' : 'text-base-content'}`}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    <span className={`text-xs font-semibold tracking-wide ${isOwn ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
                      {isOwn ? 'You' : msg.senderName || 'User'}
                    </span>
                  </div>
                </div>
                {isOwn && (
                  <div className='flex flex-col items-center ml-2'>
                    <img
                      src={msg.senderAvatar || '/avatar.png'}
                      alt='avatar'
                      className='w-9 h-9 rounded-full border-2 border-primary shadow-md mb-1 transition-transform group-hover:scale-105'
                    />
                  </div>
                )}
              </div>
            )
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