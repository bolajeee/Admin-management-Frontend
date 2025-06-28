import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader } from 'lucide-react';

export default function AdminRoute({ children }) {
  const { authUser, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!authUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is not an admin, redirect to home
  if (authUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
