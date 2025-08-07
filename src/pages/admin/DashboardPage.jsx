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
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

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

  // Analytics state
  const [tasksCompletedData, setTasksCompletedData] = useState([]);
  const [memosReadData, setMemosReadData] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

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
    fetchAnalytics();
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

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const [tasksRes, memosRes] = await Promise.all([
        axiosInstance.get('/tasks/analytics/completed'),
        axiosInstance.get('/memos/analytics/read'),
      ]);
      setTasksCompletedData(tasksRes.data.data || []);
      setMemosReadData(memosRes.data.data || []);
    } catch (err) {
      setTasksCompletedData([]);
      setMemosReadData([]);
    } finally {
      setAnalyticsLoading(false);
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <QuickActions
          actions={actions}
          loading={loadingActions}
          onAddUser={handleAddUser}
          onSendMemo={handleSendMemo}
          onCreateTask={handleCreateTask}
          navigate={navigate}
        />
        {/* Analytics Charts */}
        <div className="bg-base-100 rounded-lg p-4 shadow flex flex-col gap-6">
          <h2 className="text-lg font-semibold mb-3">Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tasks Completed Chart */}
            <div>
              <h3 className="text-base font-medium mb-2">Tasks Completed (Last 30 Days)</h3>
              <div className="min-h-[200px]">
                {analyticsLoading ? (
                  <div className="flex items-center justify-center h-full animate-pulse text-base-content/60">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={tasksCompletedData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            {/* Memos Read Chart */}
            <div>
              <h3 className="text-base font-medium mb-2">Memos Read (Last 30 Days)</h3>
              <div className="min-h-[200px]">
                {analyticsLoading ? (
                  <div className="flex items-center justify-center h-full animate-pulse text-base-content/60">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={memosReadData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Recent Activity */}
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