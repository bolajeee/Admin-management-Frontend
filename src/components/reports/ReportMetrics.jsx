// src/components/reports/ReportMetrics.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import MetricCard from './MetricCard';
import { Spin } from 'antd';
import { Users, DollarSign, TrendingUp, Clock } from 'lucide-react';

const ReportMetrics = ({ metrics, loading }) => {
  if (loading) {
    return (
      <Card className="p-8 flex justify-center">
        <Spin size="large" />
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent>
          <p className="text-base-content/60 text-center py-8">
            No metrics data available. Try changing your date range.
          </p>
        </CardContent>
      </Card>
    );
  }

  const metricCards = [
    {
      title: 'Total Users',
      value: metrics.totalUsers,
      icon: <Users className="h-5 w-5" />,
      trend: metrics.userGrowth,
      trendText: 'vs. previous period'
    },
    {
      title: 'Active Users',
      value: metrics.activeUsers,
      icon: <Users className="h-5 w-5" />,
      trend: 0 // No trend for this metric
    },
    {
      title: 'Total Revenue',
      value: `$${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      title: 'Avg Session Duration',
      value: `${metrics.avgSessionDuration} min`,
      icon: <Clock className="h-5 w-5" />,
      trend: 5.3,
      trendText: 'increase'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((metric, i) => (
            <MetricCard
              key={i}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              trend={metric.trend}
              trendText={metric.trendText}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportMetrics;