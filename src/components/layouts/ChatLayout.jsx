import React, { useState, useEffect } from "react";
import { MessageSquare, CheckSquare, ClipboardList, Menu, X } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import Sidebar from "../../components/Sidebar";
import NoChatSelected from "../../components/NoChatSelected";
import ChatContainer from "../../components/ChatContainer";
import TaskMemoPanel from "../../components/TaskMemoPanel";

const ChatLayout = () => {
    const { selectedUser } = useChatStore();
    const [activeTab, setActiveTab] = useState("tasks"); // Default to tasks for right panel
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024); // Open by default on desktop

    useEffect(() => {
        const handleResize = () => {
            setIsSidebarOpen(window.innerWidth >= 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="h-screen flex flex-col">
            {/* Header for HomePage - contains mobile toggles */}
            <header className="bg-base-100 border-b border-base-300 flex items-center p-2 lg:hidden">
                {/* Left Sidebar Toggle */}
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-base-200">
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <div className="flex-1 text-center text-lg font-semibold">
                    {selectedUser ? selectedUser.name : "Welcome"}
                </div>
                {/* Right Panel Toggle (Removed) */}
            </header>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left Sidebar (User List) */}
                <aside className={`
                    bg-base-100 border-r border-base-300 flex-shrink-0
                    ${isSidebarOpen ? 'w-80 translate-x-0 block' : 'w-0 -translate-x-full hidden'} 
                    ${isSidebarOpen ? 'fixed inset-y-0 left-0 z-50' : ''} 
                    lg:relative lg:w-80 lg:block lg:z-auto
                `}>
                    <Sidebar />
                </aside>

                {/* Overlay for mobile left sidebar */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                        aria-label="Close sidebar"
                    />
                )}

                {/* Main Chat Panel and Mobile Stacked Right Panel */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {selectedUser ? (
                        <ChatContainer />
                    ) : (
                        <NoChatSelected />
                    )}

                    {/* Right Panel (Tasks/Memos) - Mobile Stacked Below Chat */}
                    <div className="lg:hidden w-full flex-shrink-0 border-t border-base-300">
                        <TaskMemoPanel activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                </div>

                {/* Right Panel (Tasks/Memos) - Desktop Side-by-Side */}
                <div className="hidden lg:block lg:flex-shrink-0 lg:w-80 bg-base-100 border-l border-base-300">
                    <TaskMemoPanel activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
            </div>
        </div>
    );
};

export default ChatLayout;
