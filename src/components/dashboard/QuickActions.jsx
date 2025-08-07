// src/components/dashboard/QuickActions.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

const QuickActions = ({ actions, loading, onAddUser, onSendMemo, onCreateTask, navigate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {loading ? (
            <div className="text-sm text-base-content/60 animate-pulse">Loading actions...</div>
          ) : actions.length === 0 ? (
            <div className="text-sm text-base-content/60">No actions available.</div>
          ) : (
            actions.map((action, idx) => (
              <button
                key={idx}
                className="w-full text-left p-3 rounded-lg hover:bg-primary/10 transition-colors text-base-content"
                onClick={() => {
                  const label = action.label?.toLowerCase();
                  if (label?.includes('memo')) {
                    onSendMemo();
                  } 
                  else if (label?.includes('add employee')) {
                    onAddUser();
                  }
                  else if (label?.includes('task') || label?.includes('create task')) {
                    onCreateTask();
                  }
                  else if (action.route) {
                    navigate(action.route);
                  }
                  else if (typeof action.onClick === 'function') {
                    action.onClick();
                  }
                }}
              >
                {action.label}
              </button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;