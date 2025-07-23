import React from 'react';
import { Users, TrendingUp, DollarSign, CheckCircle } from 'lucide-react';
import MetricCard from './MetricCard';

const ReportMetrics = ({ metrics, loading }) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-base-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Team Productivity',
      value: metrics?.productivity?.toFixed(1) || '0',
      icon: <Users className="h-5 w-5" />,
      trend: metrics?.productivityTrend || 0,
      trendText: 'vs last period'
    },
    {
      title: 'Client Satisfaction',
      value: `${metrics?.satisfaction || 0}%`,
      icon: <CheckCircle className="h-5 w-5" />,
      trend: metrics?.satisfactionTrend || 0,
      trendText: 'from previous'
    },
    {
      title: 'Revenue Growth',
      value: `$${(metrics?.revenue || 0).toLocaleString()}`,
      icon: <TrendingUp className="h-5 w-5" />,
      trend: metrics?.revenueTrend || 0,
      trendText: 'growth rate'
    },
    {
      title: 'Cost Efficiency',
      value: `${metrics?.costEfficiency || 0}%`,
      icon: <DollarSign className="h-5 w-5" />,
      trend: metrics?.costEfficiencyTrend || 0,
      trendText: 'vs target'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {cards.map((card, i) => (
        <MetricCard key={i} {...card} />
      ))}
    </div>
  );
};

export default ReportMetrics;