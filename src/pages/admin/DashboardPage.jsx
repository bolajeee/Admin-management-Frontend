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
import { Clock, User, CheckSquare, Bell, MessageSquare } from 'lucide-react';

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

  // Recent Activity state
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentActivityLoading, setRecentActivityLoading] = useState(true);

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
    fetchRecentActivity();
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

  const fetchRecentActivity = async () => {
    setRecentActivityLoading(true);
    try {
      const res = await axiosInstance.get('/dashboard/recent-activity');
      setRecentActivity(res.data.data || []);
    } catch (err) {
      setRecentActivity([]);
    } finally {
      setRecentActivityLoading(false);
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
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Dashboard Stats */}
      <DashboardStats stats={stats} loading={loading} />

      {/* Analytics Charts - Full Width */}
      <div className="bg-base-100 rounded-lg p-4 md:p-6 shadow">
        <h2 className="text-xl font-semibold mb-6">Analytics Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks Completed Chart */}
          <div className="bg-base-200 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Tasks Completed (Last 30 Days)</h3>
            <div className="h-80">
              {analyticsLoading ? (
                <div className="flex items-center justify-center h-full animate-pulse text-base-content/60">
                  <div className="text-center">
                    <div className="loading loading-spinner loading-lg mb-2"></div>
                    <p>Loading analytics...</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tasksCompletedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: '#9CA3AF' }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#9CA3AF' }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#6366f1' }}
                      activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Memos Read Chart */}
          <div className="bg-base-200 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Memos Read (Last 30 Days)</h3>
            <div className="h-80">
              {analyticsLoading ? (
                <div className="flex items-center justify-center h-full animate-pulse text-base-content/60">
                  <div className="text-center">
                    <div className="loading loading-spinner loading-lg mb-2"></div>
                    <p>Loading analytics...</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={memosReadData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: '#9CA3AF' }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#9CA3AF' }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#10b981' }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-base-100 rounded-lg p-4 md:p-6 shadow">
          <QuickActions
            actions={actions}
            loading={loadingActions}
            onAddUser={handleAddUser}
            onSendMemo={handleSendMemo}
            onCreateTask={handleCreateTask}
            navigate={navigate}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-base-100 rounded-lg p-4 md:p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {recentActivityLoading ? (
            <div className="flex items-center justify-center h-32 animate-pulse text-base-content/60">
              <div className="loading loading-spinner loading-lg mr-2"></div>
              Loading recent activity...
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-base-content/60 text-sm">No recent activity.</div>
          ) : (
            <ul className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {recentActivity.map((item, idx) => {
                let Icon = Clock;
                let iconColor = 'text-base-content/60';
                if (item.type === 'user') { Icon = User; iconColor = 'text-primary'; }
                if (item.type === 'task') { Icon = CheckSquare; iconColor = 'text-blue-500'; }
                if (item.type === 'memo') { Icon = Bell; iconColor = 'text-yellow-500'; }
                if (item.type === 'message') { Icon = MessageSquare; iconColor = 'text-green-500'; }
                return (
                  <li key={idx} className="flex items-start gap-3">
                    <span className={`rounded-full bg-base-200 p-2 ${iconColor}`}><Icon className="h-5 w-5" /></span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-base-content font-medium truncate">{item.description}</div>
                      <div className="text-xs text-base-content/60 mt-0.5">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
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