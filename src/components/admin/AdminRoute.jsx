import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const authUser = useAuthStore((state) => state.authUser);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const location = useLocation();

  // Show loader while auth status is being checked
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

 
  // If not logged in
  if (!authUser) {
    console.warn('Unauthorized: No user session');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If logged in but not an admin
  if (authUser.role?.trim().toLowerCase() !== 'admin') {
    console.warn(`Unauthorized: Role '${authUser.role}' is not admin`);
    return <Navigate to="/" replace />;
  }

  // Authorized: Render the children
  return children;
};

export default AdminRoute;
