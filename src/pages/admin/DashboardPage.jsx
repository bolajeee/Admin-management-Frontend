import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, Clock, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { title: 'Total Employees', value: '1,234', icon: <Users className="h-6 w-6" /> },
    { title: 'Active Memos', value: '42', icon: <AlertTriangle className="h-6 w-6" /> },
    { title: 'Pending Tasks', value: '18', icon: <Clock className="h-6 w-6" /> },
    { title: 'Messages Today', value: '156', icon: <MessageSquare className="h-6 w-6" /> },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="text-primary">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
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
                    <p className="text-sm font-medium">New message from John Doe</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
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
              <button className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors">
                Send Company-wide Announcement
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors">
                Create New Task
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors">
                View System Logs
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
