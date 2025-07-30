// src/components/reports/TeamPerformanceChart.jsx
import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Spin, Empty } from 'antd';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const TeamPerformanceChart = ({ data, loading }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const labels = data.map(item => item.date);
    
    // Extract team member names
    const teamMembers = Object.keys(data[0]).filter(key => key !== 'date');
    
    // Generate datasets for each team member
    const datasets = teamMembers.map((member, index) => {
      // Create a deterministic color based on member name
      const hue = (member.charCodeAt(0) * 10) % 360;
      
      return {
        label: member,
        data: data.map(item => item[member]),
        borderColor: `hsl(${hue}, 70%, 50%)`,
        backgroundColor: `hsl(${hue}, 70%, 80%, 0.2)`,
        tension: 0.3
      };
    });
    
    return { labels, datasets };
  }, [data]);
  
  if (loading) {
    return (
      <Card className="p-8 flex justify-center">
        <Spin size="large" />
      </Card>
    );
  }
  
  if (!chartData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[300px]">
          <Empty description="No team performance data available" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Tasks Completed'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Date'
                  }
                }
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamPerformanceChart;