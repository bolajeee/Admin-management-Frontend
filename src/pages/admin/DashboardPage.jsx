import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Users, MessageSquare, Clock, AlertTriangle } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { axiosInstance } from '../../lib/axios';

export default function DashboardPage() {
  const { theme } = useThemeStore();
  const [stats, setStats] = useState({
    employees: null,
    memos: null,
    tasks: null,
    messagesToday: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // Replace these endpoints with your actual backend endpoints
        const [employeesRes, memosRes, tasksRes, messagesRes] = await Promise.all([
          axiosInstance.get('/employees/count'), // returns { count: number }
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
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start gap-4 p-2 hover:bg-muted/50 rounded-lg">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-base-content">New message from John Doe</p>
                    <p className="text-xs text-base-content/80">2 minutes ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <button className="w-full text-left p-3 rounded-lg hover:bg-primary/10 transition-colors text-base-content">
                Send Company-wide Memo
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-primary/10 transition-colors text-base-content">
                Create New Task
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-primary/10 transition-colors text-base-content">
                View System Logs
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
