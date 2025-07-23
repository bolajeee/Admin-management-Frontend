import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const FinancialReportChart = ({ data, subType = 'revenue', loading }) => {
  if (loading) return (
    <Card className="min-h-[350px] flex items-center justify-center">
      <div className="animate-pulse text-base-content/60">Loading financial data...</div>
    </Card>
  );

  if (!data || !data.length) return (
    <Card className="min-h-[350px] flex items-center justify-center">
      <div className="text-base-content/60">No financial data available</div>
    </Card>
  );

  // Render different chart types based on the subType
  const renderChart = () => {
    switch (subType) {
      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.3} 
              />
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'categories':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
              <Radar 
                name="Expense" 
                dataKey="value" 
                stroke="#FF8042" 
                fill="#FF8042" 
                fillOpacity={0.6} 
              />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
            </RadarChart>
          </ResponsiveContainer>
        );
        
      default:
        return <div>Invalid chart type</div>;
    }
  };

  const titles = {
    revenue: 'Revenue Trends',
    categories: 'Expense Categories'
  };

  return (
    <Card className="min-h-[350px]">
      <CardHeader>
        <CardTitle>{titles[subType] || 'Financial Report'}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default FinancialReportChart;