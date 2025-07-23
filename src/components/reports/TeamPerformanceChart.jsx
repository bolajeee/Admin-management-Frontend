import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#83a6ed'];

const TeamPerformanceChart = ({ data, loading }) => {
  if (loading) return (
    <Card className="min-h-[350px] flex items-center justify-center">
      <div className="animate-pulse text-base-content/60">Loading team performance data...</div>
    </Card>
  );

  if (!data || !data.length) return (
    <Card className="min-h-[350px] flex items-center justify-center">
      <div className="text-base-content/60">No team performance data available</div>
    </Card>
  );

  return (
    <Card className="min-h-[350px]">
      <CardHeader>
        <CardTitle>Task Completion by Team Member</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} tasks`, 'Completed']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TeamPerformanceChart;