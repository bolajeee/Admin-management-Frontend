import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const ClientActivityChart = ({ data, loading }) => {
  if (loading) return (
    <Card className="min-h-[350px] flex items-center justify-center">
      <div className="animate-pulse text-base-content/60">Loading client activity data...</div>
    </Card>
  );

  if (!data || !data.length) return (
    <Card className="min-h-[350px] flex items-center justify-center">
      <div className="text-base-content/60">No client activity data available</div>
    </Card>
  );

  return (
    <Card className="min-h-[350px]">
      <CardHeader>
        <CardTitle>Client Activity Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="interactions" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }} 
              name="Interactions"
            />
            <Line 
              type="monotone" 
              dataKey="responses" 
              stroke="#82ca9d" 
              name="Responses"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ClientActivityChart;