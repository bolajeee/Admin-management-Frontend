import { useState } from "react";
import { MessageSquare, CheckSquare, ClipboardList, Menu } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import UserMemosPanel from "../components/UserMemosPanel";
import UserTasksPanel from "../components/UserTasksPanel";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import TabButton from "../components/ui/TabButton";

// TODO: Move activeTab and isSidebarOpen to a global state manager like Zustand or Redux

const HomePage = () => {
    const { selectedUser } = useChatStore();
    const [activeTab, setActiveTab] = useState("chat");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="h-screen bg-base-200 flex flex-col">
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className={`bg-base-100 border-r border-base-300 transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
                    <Sidebar />
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col">
                    {/* Header */}
                    <header className="bg-base-100 border-b border-base-300 flex items-center p-2">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-base-200">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex-1 text-center text-lg font-semibold">
                            {selectedUser ? selectedUser.name : "Welcome"}
                        </div>
                    </header>

                    {/* Content Area */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Chat and Panels */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {selectedUser ? (
                                <ChatContainer />
                            ) : (
                                <NoChatSelected />
                            )}
                        </div>

                        {/* Right Panel with Tabs */}
                        <div className="w-full md:w-[380px] border-l border-base-300 bg-base-100 flex flex-col">
                            <div className="flex border-b border-base-300">
                                <TabButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')}>
                                    <div className="flex items-center justify-center gap-2">
                                        <CheckSquare className="w-5 h-5" />
                                        <span>Tasks</span>
                                    </div>
                                </TabButton>
                                <TabButton active={activeTab === 'memos'} onClick={() => setActiveTab('memos')}>
                                    <div className="flex items-center justify-center gap-2">
                                        <ClipboardList className="w-5 h-5" />
                                        <span>Memos</span>
                                    </div>
                                </TabButton>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {activeTab === 'tasks' && <UserTasksPanel />}
                                {activeTab === 'memos' && <UserMemosPanel />}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default HomePage;