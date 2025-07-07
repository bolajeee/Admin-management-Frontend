// components/dashboard/RecentActivity.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { MessageSquare } from 'lucide-react';

const RecentActivity = ({ activity, loading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-sm text-base-content/60 animate-pulse">Loading recent activity...</div>
          ) : activity.length === 0 ? (
            <div className="text-sm text-base-content/60">No recent activity.</div>
          ) : (
            activity.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-lg">
                <div className="bg-primary/10 p-2 rounded-full">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-primary text-sm">{item.sender?.name || 'Unknown'}</span>
                    <span className="text-xs text-base-content/60">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <span className="text-sm text-base-content">
                    {item.text || <span className="italic text-base-content/50">No message text</span>}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
