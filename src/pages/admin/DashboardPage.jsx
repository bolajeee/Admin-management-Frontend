// src/pages/admin/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../lib/axios';
import DashboardStats from '../../components/dashboard/DashboardStats';
import QuickActions from '../../components/dashboard/QuickActions';
import MemoModal from '../../components/modals/MemoModal';
import TaskModal from '../../components/modals/TaskModal'; // Use your existing TaskModal
import { useTaskStore } from '../../store/useTaskStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore'; // To get users list

function DashboardPage() {
  const [stats, setStats] = useState({
    employees: 0,
    memos: 0,
    tasks: 0,
    messagesToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState([]);
  const [loadingActions, setLoadingActions] = useState(true);
  
  // Memo modal state
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [memoTitle, setMemoTitle] = useState('');
  const [memoText, setMemoText] = useState('');
  const [sendingMemo, setSendingMemo] = useState(false);

  // Task modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [submittingTask, setSubmittingTask] = useState(false);
  
  // Navigation
  const navigate = useNavigate();
  
  // Get task creation function from store
  const createTask = useTaskStore((state) => state.createTask);
  const authUser = useAuthStore((state) => state.authUser);
  
  // For the task modal - we need the users list
  const { users, getUsers, isUsersLoading } = useChatStore();
  
  useEffect(() => {
    fetchDashboardStats();
    fetchSuggestedActions();
    if (users.length === 0) {
      getUsers(); // Fetch users if not already loaded
    }
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/dashboard/stats');
      setStats({
        ...response.data,
        messagesToday: 0 // This will be updated below if possible
      });
      
      // Try to fetch messages count
      try {
        const messagesResponse = await axiosInstance.get('/messages/today');
        if (messagesResponse.data && typeof messagesResponse.data.count === 'number') {
          setStats(prev => ({
            ...prev,
            messagesToday: messagesResponse.data.count
          }));
        }
      } catch (msgError) {
        console.error('Error getting today messages count:', msgError);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedActions = async () => {
    setLoadingActions(true);
    try {
      const response = await axiosInstance.get('/admin/suggested-actions');
      setActions(response.data.actions);
    } catch (error) {
      console.error('Error fetching suggested actions:', error);
      setActions([]);
    } finally {
      setLoadingActions(false);
    }
  };

  const handleAddUser = () => {
    navigate('/admin/employees');
  };

  const handleSendMemo = () => {
    setShowMemoModal(true);
  };

  const handleCreateTask = () => {
    setShowTaskModal(true);
  };

  const handleMemoSubmit = async () => {
    if (!memoTitle.trim() || !memoText.trim()) {
      return;
    }

    setSendingMemo(true);
    try {
      await axiosInstance.post('/memos/broadcast', {
        title: memoTitle,
        content: memoText
      });
      
      // Reset and close modal on success
      setMemoTitle('');
      setMemoText('');
      setShowMemoModal(false);
      
      // Refresh dashboard stats to show the new memo count
      fetchDashboardStats();
    } catch (error) {
      console.error('Error sending memo:', error);
      alert('Failed to send memo. Please try again.');
    } finally {
      setSendingMemo(false);
    }
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      setSubmittingTask(true);
      await createTask(taskData);
      setShowTaskModal(false);
      
      // Refresh dashboard stats to show the updated task count
      fetchDashboardStats();
    } catch (error) {
      console.error("Error creating task:", error);
      // Let the modal handle the error display
      throw error;
    } finally {
      setSubmittingTask(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Dashboard Stats */}
      <DashboardStats stats={stats} loading={loading} />

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <QuickActions 
          actions={actions} 
          loading={loadingActions} 
          onAddUser={handleAddUser} 
          onSendMemo={handleSendMemo}
          onCreateTask={handleCreateTask}
          navigate={navigate}
        />

        {/* Add other dashboard components here */}
        <div className="bg-base-100 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
          <div className="text-base-content/60 text-sm">
            Your recent activity will appear here.
          </div>
        </div>
      </div>

      {/* Memo Modal */}
      <MemoModal
        show={showMemoModal}
        onClose={() => setShowMemoModal(false)}
        memoTitle={memoTitle}
        setMemoTitle={setMemoTitle}
        memoText={memoText}
        setMemoText={setMemoText}
        onSendMemo={handleMemoSubmit}
        sendingMemo={sendingMemo}
      />
      
      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          show={showTaskModal}  
          onClose={() => setShowTaskModal(false)}
          onSubmit={handleTaskSubmit}
          submitting={submittingTask}
          initialTask={{}} // Empty task for creation
          users={users}  // Pass the users list
          mode="create"
        />
      )}
    </div>
  );
}

export default DashboardPage;