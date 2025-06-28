import React, { useEffect } from 'react'
import MessageInput from './MessageInput'
import ChatHeader from './ChatHeader'
import { useChatStore } from '../store/useChatStore.js'

const ChatContainer = () => {

  const { messages, getMessages, isMessagesLoading, selectedUser } = useChatStore()

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id)
    }
  }, [selectedUser._id, getMessages])

  if (isMessagesLoading) return <div className='flex-1 flex items-center justify-center'>
    <p className='text-sm text-gray-500'>Loading messages...</p>
    </div>

  return (
    <div className='flex-1 flex flex-col overflow-auto'>
      <ChatHeader />

      <p>Messages...</p>

      <MessageInput />

    </div>
  )
}

export default ChatContainer