import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Users, MessageSquare, Clock, AlertTriangle } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { axiosInstance } from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import MemoModal from "../../components/MemoModal";

export default function DashboardPage() {
  const { theme } = useThemeStore();
  const [stats, setStats] = useState({
    employees: null,
    memos: null,
    tasks: null,
    messagesToday: null
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [actions, setActions] = useState([]);
  const [actionsLoading, setActionsLoading] = useState(true);
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [memoText, setMemoText] = useState("");
  const [sendingMemo, setSendingMemo] = useState(false);
  const [memoRoute, setMemoRoute] = useState('/memos/send-company');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'employee' });
  const [addingUser, setAddingUser] = useState(false);

  const navigate = useNavigate();


  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // Replace these endpoints with your actual backend endpoints
        const [employeesRes, memosRes, tasksRes, messagesRes] = await Promise.all([
          axiosInstance.get('messages/employees/count'), // returns { count: number }
          axiosInstance.get('/memos/count'),     // returns { count: number }
          axiosInstance.get('/tasks/count'),     // returns { count: number }
          axiosInstance.get('/messages/today'),  // returns { count: number }
        ]);
        setStats({
          employees: employeesRes.data.count,
          memos: memosRes.data.count,
          tasks: tasksRes.data.count,
          messagesToday: messagesRes.data.count,
        });
      } catch (err) {
        setStats({ employees: '-', memos: '-', tasks: '-', messagesToday: '-' });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchRecentActivity() {
      setActivityLoading(true);
      try {
        const res = await axiosInstance.get('/messages/recent'); // [{ senderName, text, createdAt }]
        setRecentActivity(Array.isArray(res.data.messages) ? res.data.messages : []);
      } catch (err) {
        setRecentActivity([]);
      } finally {
        setActivityLoading(false);
      }
    }
    fetchRecentActivity();
  }, []);

  useEffect(() => {
    async function fetchSuggestedActions() {
      setActionsLoading(true);
      try {
        const res = await axiosInstance.get('/admin/suggested-actions'); // [{ label, onClickAction }]
        setActions(Array.isArray(res.data.actions) ? res.data.actions : []);
      } catch (err) {
        setActions([]);
      } finally {
        setActionsLoading(false);
      }
    }
    fetchSuggestedActions();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    try {
      const res = await axiosInstance.post('/auth/create', newUser); // adjust backend route as needed
      toast.success("User added successfully");
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', role: 'employee' });
    } catch {
      toast.error("Failed to add user.");
    } finally {
      setAddingUser(false);
    }
  };


  const statCards = [
    { title: 'Total Employees', value: stats.employees, icon: <Users className="h-6 w-6" /> },
    { title: 'Active Memos', value: stats.memos, icon: <AlertTriangle className="h-6 w-6" /> },
    { title: 'Pending Tasks', value: stats.tasks, icon: <Clock className="h-6 w-6" /> },
    { title: 'Messages Today', value: stats.messagesToday, icon: <MessageSquare className="h-6 w-6" /> },
  ];

  return (
    <div className="p-6" data-theme={theme}>
      <h1 className="text-3xl font-bold mb-8 pt-[60px]">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-base-content">
                {stat.title}
              </CardTitle>
              <div className="text-primary">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-base-content">
                {loading ? <span className="animate-pulse">...</span> : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLoading ? (
                <div className="text-sm text-base-content/60 animate-pulse">Loading recent activity...</div>
              ) : recentActivity.length === 0 ? (
                <div className="text-sm text-base-content/60">No recent activity.</div>
              ) : (
                recentActivity.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-lg">
                    <div className="bg-primary/10 p-2 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-primary text-sm">{item.sender?.name || 'Unknown'}</span>
                        <span className="text-xs text-base-content/60">{item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>
                      <span className="text-sm text-base-content leading-snug">{item.text || <span className='italic text-base-content/50'>No message text</span>}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        {/**suggested action */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {actionsLoading ? (
                <div className="text-sm text-base-content/60 animate-pulse">Loading actions...</div>
              ) : actions.length === 0 ? (
                <div className="text-sm text-base-content/60">No actions available.</div>
              ) : (
                actions.map((action, idx) => (
                  <button
                    key={idx}
                    className="w-full text-left p-3 rounded-lg hover:bg-primary/10 transition-colors text-base-content"
                    onClick={() => {
                      if (action.label && action.label.toLowerCase().includes('memo')) {
                        setMemoRoute(action.route || '/memos/send-company');
                        setShowMemoModal(true);
                      } else if (action.label && action.label.toLowerCase().includes('add employee')) {
                        setShowAddUserModal(true);
                      } else if (action.route) {
                        navigate(action.route);
                      } else if (typeof action.onClick === 'function') {
                        action.onClick();
                      }
                    }}
                    type="button"
                  >
                    {action.label}
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <MemoModal
        show={showMemoModal}
        onClose={() => setShowMemoModal(false)}
        memoText={memoText}
        setMemoText={setMemoText}
        sendingMemo={sendingMemo}
        onSendMemo={async () => {
          setSendingMemo(true);
          try {
            await axiosInstance.post(memoRoute, { title: memoText.substring(0, 20), content: memoText }, { withCredentials: true });
            setShowMemoModal(false);
            setMemoText("");
            toast.success("Memo sent to all employees!");
          } catch (err) {
            toast.error("Failed to send memo. Please try again.");
          } finally {
            setSendingMemo(false);
          }
        }}
      />

      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-base-100 p-6 rounded-xl shadow-lg w-[90%] max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Employee</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-base-200 text-base-content"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-base-200 text-base-content"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-base-200 text-base-content"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-md bg-base-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingUser}
                  className="px-4 py-2 rounded-md bg-primary text-white text-sm"
                >
                  {addingUser ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
