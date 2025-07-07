// components/dashboard/DashboardStats.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users, AlertTriangle, Clock, MessageSquare } from 'lucide-react';

const statIcons = [Users, AlertTriangle, Clock, MessageSquare];

const DashboardStats = ({ stats, loading }) => {
  const statCards = [
    { title: 'Total Employees', value: stats.employees },
    { title: 'Active Memos', value: stats.memos },
    { title: 'Pending Tasks', value: stats.tasks },
    { title: 'Messages Today', value: stats.messagesToday },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {statCards.map((stat, i) => {
        const Icon = statIcons[i];
        return (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-base-content">
                {stat.title}
              </CardTitle>
              <div className="text-primary">
                <Icon className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-base-content">
                {loading ? <span className="animate-pulse">...</span> : stat.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;
