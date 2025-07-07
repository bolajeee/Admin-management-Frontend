import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react"; // Requires lucide-react or you can replace with any icon

import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import UserMemosPanel from "../components/UserMemosPanel";
import UserTasksPanel from "../components/UserTasksPanel";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const authUser = useAuthStore((state) => state.authUser);

  const [showTasks, setShowTasks] = useState(true);
  const [showMemos, setShowMemos] = useState(true);

  const toggleTasks = () => setShowTasks((prev) => !prev);
  const toggleMemos = () => setShowMemos((prev) => !prev);


  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-[90vw] h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">

            {/* Sidebar */}
            <div className="flex flex-col min-h-0 border-r border-base-300">
              <div className="flex-1 overflow-y-auto min-h-0">
                <Sidebar />
              </div>
            </div>

            {/* Main Chat + Right Drawer */}
            <div className="flex flex-1 min-h-0">

              {/* ChatContainer */}
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto min-h-0">
                  {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
                </div>
              </div>

              {/* Drawer Panel (Tasks + Memos) */}
              <div className="w-[280px] flex flex-col border-l border-base-300 bg-base-100">
                {/* Tasks Header + Content */}
                <div className="flex flex-col border-b border-base-300 min-h-0">
                  <div className="flex items-center justify-between px-3 py-2 font-semibold border-b border-base-300">
                    <span>Tasks</span>
                    <button onClick={toggleTasks}>
                      {showTasks ? <ChevronUp /> : <ChevronDown />}
                    </button>
                  </div>
                  {showTasks && (
                    <div className="flex-1 overflow-y-auto min-h-0">
                      <UserTasksPanel />
                    </div>
                  )}
                </div>

                {/* Memos Header + Content */}
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex items-center justify-between px-3 py-2 font-semibold border-b border-base-300">
                    <span>Memos</span>
                    <button onClick={toggleMemos}>
                      {showTasks ? <ChevronUp /> : <ChevronDown />}
                    </button>
                  </div>
                  {showMemos && (
                    <div className="flex-1 overflow-y-auto min-h-0">
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
