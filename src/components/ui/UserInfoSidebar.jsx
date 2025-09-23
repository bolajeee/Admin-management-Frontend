import React from 'react';

const UserInfoSidebar = ({ user, onClose }) => {
  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end items-stretch pointer-events-none">
      <div className="bg-base-100 shadow-2xl w-full max-w-md h-full flex flex-col gap-6 p-8 border-l-2 border-primary pointer-events-auto animate-slide-in-right relative transition-all duration-300">
        <button
          className="btn btn-sm absolute top-4 right-4 z-10"
          onClick={onClose}
        >
          Close
        </button>
        <div className="flex flex-col items-center gap-2 mt-6">
          {user.profilePicture && user.profilePicture.trim() !== "" ? (
            <img
              src={user.profilePicture}
              alt={user.name || user.email}
              className="w-24 h-24 rounded-full border-2 border-primary shadow"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-2 border-primary bg-base-300 flex items-center justify-center text-4xl font-bold text-primary shadow">
              {(user.name || user.email || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          )}
          <div className="text-2xl font-bold mt-2">{user.name || user.email}</div>
          <div className="text-base-content/70 text-lg">{user.email}</div>
          <div className="text-base-content/70 text-base">Role: <span className="font-semibold">{user.role || 'N/A'}</span></div>
        </div>
        <div className="mt-8">
          <div className="font-semibold text-base mb-2 border-b pb-1 border-base-300">User Details</div>
          <div className="text-sm text-base-content/80 space-y-1">
            {/* Add more user info here if available */}
            <div><span className="font-semibold">Email:</span> {user.email}</div>
            <div><span className="font-semibold">Role:</span> {user.role || 'N/A'}</div>
            {/* Add more fields as needed */}
          </div>
        </div>
      </div>
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />
    </div>
  );
};

export default UserInfoSidebar;
