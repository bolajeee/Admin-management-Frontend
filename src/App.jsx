import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import { Loader } from 'lucide-react';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import SignUpPage from './pages/SignupPage';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminRoute from './components/admin/AdminRoute';
import DashboardPage from './pages/admin/DashboardPage';
import EmployeesPage from './pages/admin/EmployeesPage';
import MessagesPage from './pages/admin/MessagesPage';
import MemosPage from './pages/admin/MemosPage';
import TasksPage from './pages/admin/TasksPage';
import ReportsPage from './pages/admin/ReportsPage';
import AdminSettingsPage from './pages/admin/SettingsPage';

// Stores
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';

// Route guard
const RequireAuth = ({ children }) => {
  const { authUser } = useAuthStore();
  return authUser ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
   const { initializeTheme, theme } = useThemeStore();

    useEffect(() => {
        initializeTheme();
    }, [initializeTheme]);

  useEffect(() => {
    checkAuth();
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Navbar />  
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" replace />}
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <RequireAuth>
              
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />

        {/* Admin Routes (already guarded in AdminRoute) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="messages/:id" element={<MessagesPage />} />
          <Route path="memos" element={<MemosPage />} />
          <Route path="memos/:id" element={<MemosPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/:id" element={<TasksPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
