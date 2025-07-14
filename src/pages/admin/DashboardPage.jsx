import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useThemeStore } from '../../store/useThemeStore';
import { axiosInstance } from '../../lib/axios';

// Modular components
import DashboardStats from '../../components/dashboard/DashboardStats';
import RecentActivity from '../../components/dashboard/RecentActivity'
import QuickActions from '../../components/dashboard/QuickActions';
import MemoModal from '../../components/modals/MemoModal';
import AddUserModal from '../../components/modals/AddUserModal';

export default function DashboardPage() {
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ employees: null, memos: null, tasks: null, messagesToday: null });
  const [recentActivity, setRecentActivity] = useState([]);
  const [actions, setActions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [actionsLoading, setActionsLoading] = useState(true);

  const [showMemoModal, setShowMemoModal] = useState(false);
  const [memoText, setMemoText] = useState('');
  // No need for memoRoute, use /memos/broadcast directly
  const [sendingMemo, setSendingMemo] = useState(false);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'employee' });
  const [addingUser, setAddingUser] = useState(false);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [employeesRes, memosRes, tasksRes, messagesRes] = await Promise.all([
          axiosInstance.get('messages/employees/count'),
          axiosInstance.get('/memos/count'),
          axiosInstance.get('/tasks/count'),
          axiosInstance.get('/messages/today'),
        ]);
        setStats({
          employees: employeesRes.data.count,
          memos: memosRes.data.count,
          tasks: tasksRes.data.count,
          messagesToday: messagesRes.data.count,
        });
      } catch {
        setStats({ employees: '-', memos: '-', tasks: '-', messagesToday: '-' });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch recent activity
  useEffect(() => {
    const fetchRecentActivity = async () => {
      setActivityLoading(true);
      try {
        const res = await axiosInstance.get('/messages/recent');
        setRecentActivity(Array.isArray(res.data.messages) ? res.data.messages : []);
      } catch {
        setRecentActivity([]);
      } finally {
        setActivityLoading(false);
      }
    };
    fetchRecentActivity();
  }, []);

  // Fetch suggested actions
  useEffect(() => {
    const fetchActions = async () => {
      setActionsLoading(true);
      try {
        const res = await axiosInstance.get('/admin/suggested-actions');
        setActions(Array.isArray(res.data.actions) ? res.data.actions : []);
      } catch {
        setActions([]);
      } finally {
        setActionsLoading(false);
      }
    };
    fetchActions();
  }, []);

  // Handle Add User
  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    try {
      await axiosInstance.post('/auth/create', newUser);
      toast.success('User added successfully');
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', role: 'employee' });
    } catch {
      toast.error('Failed to add user.');
    } finally {
      setAddingUser(false);
    }
  };

  return (
    <div className="p-6" data-theme={theme}>
      <h1 className="text-3xl font-bold mb-8 pt-[60px]">Admin Dashboard</h1>

      {/* Stats */}
      <DashboardStats stats={stats} loading={loading} />

      {/* Activity + Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivity activity={recentActivity} loading={activityLoading} />
        <QuickActions
          actions={actions}
          loading={actionsLoading}
          navigate={navigate}
          onSendMemo={() => {
            setMemoRoute('/memos/send-company');
            setShowMemoModal(true);
          }}
          onAddUser={() => setShowAddUserModal(true)}
        />
      </div>

      {/* Modals */}
      <MemoModal
        show={showMemoModal}
        onClose={() => setShowMemoModal(false)}
        memoText={memoText}
        setMemoText={setMemoText}
        sendingMemo={sendingMemo}
        onSendMemo={async () => {
          setSendingMemo(true);
          try {
            await axiosInstance.post('/memos/broadcast', {
              title: memoText.substring(0, 20),
              content: memoText,
            });
            toast.success("Memo sent to all employees!");
            setShowMemoModal(false);
            setMemoText("");
          } catch {
            toast.error("Failed to send memo.");
          } finally {
            setSendingMemo(false);
          }
        }}
      />

      <AddUserModal
        open={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        newUser={newUser}
        setNewUser={setNewUser}
        onSubmit={handleAddUser}
        loading={addingUser}
      />
    </div>
  );
}
