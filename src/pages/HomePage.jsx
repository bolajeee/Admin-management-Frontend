
import { useState } from "react";
import { ChevronDown, ChevronUp, ScrollText } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import UserMemosPanel from "../components/UserMemosPanel";
import UserTasksPanel from "../components/UserTasksPanel";



/**
 * HomePage - Main landing page for authenticated users.
 *
 * Layout:
 * - Sidebar: List of users/chats.
 * - ChatContainer: Main chat area (shows chat or placeholder).
 * - UserTasksPanel: Shows user's tasks in a collapsible panel.
 * - UserMemosPanel: Shows user's memos in a collapsible panel.
 *
 * This layout is responsive and beginner-friendly.
 */
const HomePage = () => {
  // Get the currently selected user from chat store
  const { selectedUser } = useChatStore();

  // State to control visibility of tasks and memos panels
  const [showTasks, setShowTasks] = useState(true);
  const [showMemos, setShowMemos] = useState(true);

  // Toggle visibility of tasks panel
  const toggleTasks = () => setShowTasks((prev) => !prev);
  // Toggle visibility of memos panel
  const toggleMemos = () => setShowMemos((prev) => !prev);

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        {/* Main container for chat and panels */}
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-[90vw] h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">

            {/* Sidebar: List of users/chats */}
            <div className="flex flex-col min-h-0 border-r border-base-300">
              <div className="flex-1 overflow-y-auto min-h-0">
                {/* Sidebar displays all users/chats for navigation */}
                <Sidebar />
              </div>
            </div>

            {/* Main Chat + Right Drawer */}
            <div className="flex flex-1 min-h-0">

              {/* ChatContainer: Shows chat or placeholder if no user selected */}
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto min-h-0">
                  {/* If no user is selected, show a placeholder. Otherwise, show the chat. */}
                  {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
                </div>
              </div>

              {/* Drawer Panel (Tasks + Memos) */}
              <div className="w-[380px] flex flex-col border-l border-base-300 bg-base-100 overflow-hidden">
                {/* Tasks Header + Content */}
                <div className={`flex flex-col border-b border-base-300 ${showMemos ? 'h-1/2' : 'h-full'} transition-all duration-200`}>
                  <div className="flex items-center justify-between px-3 py-2 font-semibold border-b border-base-300">
                    
                      <div className="flex items-center gap-2  text-primary font-semibold">
                            <ScrollText className="w-5 h-5" />
                            <h2 className="text-lg">Tasks</h2>
                          </div>



                    {/* Toggle button for tasks panel */}
                    <button onClick={toggleTasks} aria-label={showTasks ? 'Hide tasks' : 'Show tasks'}>
                      {showTasks ? <ChevronUp /> : <ChevronDown />}
                    </button>
                  </div>
                  {showTasks && (
                    <div className="overflow-y-auto h-[calc(100%-40px)]">
                      {/* UserTasksPanel displays the user's tasks */}
                      <UserTasksPanel />
                    </div>
                  )}
                </div>

                {/* Memos Header + Content */}
                <div className={`flex flex-col ${showTasks ? 'h-1/2' : 'h-full'} transition-all duration-200`}>
                  <div className="flex items-center justify-between px-3 py-2 font-semibold border-b border-base-300">
                    
                      <div className="flex items-center gap-2  text-primary font-semibold">
                            <ScrollText className="w-5 h-5" />
                            <h2 className="text-lg">Memos</h2>
                          </div>
                    {/* Toggle button for memos panel */}
                    <button onClick={toggleMemos} aria-label={showMemos ? 'Hide memos' : 'Show memos'}>
                      {showMemos ? <ChevronUp /> : <ChevronDown />}
                    </button>
                  </div>
                  {showMemos && (
                    <div className="overflow-y-auto h-[calc(100%-40px)]">
                      {/* UserMemosPanel displays the user's memos */}
                      <UserMemosPanel />
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
