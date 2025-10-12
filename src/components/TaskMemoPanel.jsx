import React from 'react';
import { CheckSquare, ClipboardList } from 'lucide-react';
import TabButton from './ui/TabButton';
import UserTasksPanel from './UserTasksPanel';
import UserMemosPanel from './UserMemosPanel';

const TaskMemoPanel = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-col h-full">
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
  );
};

export default TaskMemoPanel;
