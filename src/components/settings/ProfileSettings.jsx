import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import PasswordChangeForm from '../PasswordChangeForm';
import ProfileUpdateForm from './ProfileUpdateForm';

const ProfileSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Update Profile</h3>
            <ProfileUpdateForm />
          </div>
          <div className="divider"></div>
          <div>
            <h3 className="text-lg font-medium">Change Password</h3>
            <PasswordChangeForm />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
