import React, { useState } from 'react';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import SettingsPanel from './SettingsPanel';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { RefreshCw } from 'lucide-react';

export default function AdminUserSettingsPanel() {
  const { users, isLoading, error } = useAdminUsers();
  const [selectedUserId, setSelectedUserId] = useState(null);

  const selectedUser = users.find(u => u._id === selectedUserId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage User Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-6">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-error">{error}</div>
          ) : (
            <select
              className="select select-bordered w-full max-w-xs"
              value={selectedUserId || ''}
              onChange={e => setSelectedUserId(e.target.value)}
            >
              <option value="" disabled>Select a user...</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          )}
        </CardContent>
      </Card>
      {selectedUser && (
        <SettingsPanel
          isAdmin={true}
          userId={selectedUser._id}
          initialSettings={selectedUser.settings}
        />
      )}
    </div>
  );
}
