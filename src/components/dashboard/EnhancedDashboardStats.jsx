import React from 'react';
import { Users, Bell, CheckSquare, MessageSquare, TrendingUp, Activity, Clock, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, title, value, change, changeType, color, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`bg-gradient-to-br ${color} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        </div>
        {change && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-white/20`}>
            <TrendingUp className={`h-4 w-4 ${changeType === 'positive' ? 'text-green-300' : 'text-red-300'}`} />
            <span className="text-white text-xs font-medium">{change}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const EnhancedDashboardStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-base-200 rounded-xl p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-base-300 rounded-lg"></div>
              <div className="space-y-2">
                <div className="w-20 h-4 bg-base-300 rounded"></div>
                <div className="w-16 h-6 bg-base-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      title: 'Total Employees',
      value: stats.employees || 0,
      change: '+12%',
      changeType: 'positive',
      color: 'from-blue-500 to-blue-600',
      delay: 0
    },
    {
      icon: CheckSquare,
      title: 'Active Tasks',
      value: stats.tasks || 0,
      change: '+8%',
      changeType: 'positive',
      color: 'from-green-500 to-green-600',
      delay: 0.1
    },
    {
      icon: Bell,
      title: 'Memos Sent',
      value: stats.memos || 0,
      change: '+15%',
      changeType: 'positive',
      color: 'from-yellow-500 to-orange-500',
      delay: 0.2
    },
    {
      icon: MessageSquare,
      title: 'Messages Today',
      value: stats.messagesToday || 0,
      change: '+5%',
      changeType: 'positive',
      color: 'from-purple-500 to-purple-600',
      delay: 0.3
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>
      
      {/* Additional Quick Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-base-100 rounded-lg p-4 border border-base-300 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-base-content">System Status</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Online</span>
            </div>
          </div>
        </div>
        
        <div className="bg-base-100 rounded-lg p-4 border border-base-300 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-info" />
              <span className="text-sm font-medium text-base-content">Avg Response Time</span>
            </div>
            <span className="text-sm font-bold text-info">2.3s</span>
          </div>
        </div>
        
        <div className="bg-base-100 rounded-lg p-4 border border-base-300 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Target className="h-5 w-5 text-success" />
              <span className="text-sm font-medium text-base-content">Task Completion</span>
            </div>
            <span className="text-sm font-bold text-success">87%</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedDashboardStats;