import React, { useEffect, useRef } from 'react'
import MessageInput from './MessageInput'
import ChatHeader from './ChatHeader'
import { useChatStore } from '../store/useChatStore.js'

const ChatContainer = () => {
  const { getMessages, isMessagesLoading, selectedUser, messages } = useChatStore()
  const messagesEndRef = useRef(null)

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
    <div className='flex-1 flex flex-col overflow-auto bg-base-100 rounded-lg shadow-md'>
      <ChatHeader />
      <div className='flex-1 overflow-y-auto px-4 py-2 space-y-2'>
        {messages && messages.length > 0 ? (
          messages.map((msg, idx) => (
            <div key={msg._id || idx} className={`chat ${msg.isOwn ? 'chat-end' : 'chat-start'}`}>
              <div className='chat-image avatar'>
                <div className='w-8 rounded-full bg-base-200'>
                  <img src={msg.senderAvatar || '/avatar.png'} alt='avatar' />
                </div>
              </div>
              <div className='chat-header text-xs text-gray-500 dark:text-gray-400'>
                {msg.senderName || (msg.isOwn ? 'You' : 'User')}
                <time className='ml-2 opacity-70'>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ''}</time>
              </div>
              <div className='chat-bubble bg-base-200 dark:bg-base-300 text-base-content'>
                {msg.text && <span>{msg.text}</span>}
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt='attachment'
                    className='mt-2 max-w-xs max-h-48 rounded-lg border border-base-300 shadow'
                  />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className='text-center text-gray-400 py-8'>No messages yet. Start the conversation!</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className='border-t border-base-200 p-2 bg-base-100'>
        <MessageInput />
      </div>
    </div>
  )
}

export default ChatContainer