import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";


/**
 * LoginPage - User authentication page for sign-in.
 *
 * Features:
 * - Email/password login form with validation and error handling.
 * - Password visibility toggle for user convenience.
 * - Redirects user after successful login based on role.
 * - Shows loading spinner while checking authentication status.
 * - Responsive and accessible layout.
 */
const LoginPage = () => {
  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  // State for form input values
  const [formData, setFormData] = useState({ email: "", password: "" });
  // State for error messages
  const [error, setError] = useState(null);
  // State to track initial auth check
  const [isInitialCheck, setIsInitialCheck] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  // Redirect path after login
  const from = location.state?.from?.pathname || "/";

  // Auth store: login function, loading states, user info
  const { login, isLoggingIn, authUser, isCheckingAuth } = useAuthStore();

  // Redirect after successful login or if already authenticated
  useEffect(() => {
    if (isInitialCheck) {
      setIsInitialCheck(false);
      return;
    }
    // If user is authenticated and not checking auth, redirect
    if (authUser?.role && !isCheckingAuth) {
      authUser.role === "admin"
        ? navigate("/admin/dashboard")
        : navigate(from);
    }
  }, [authUser, isCheckingAuth, isInitialCheck, navigate, from]);

  // Handle form submission for login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const success = await login(formData);
      // If login fails, show error
      if (!success) {
        setError("Login failed. Please check your credentials.");
      }
    } catch (error) {
      // Show error from backend or generic message
      setError(
        error.response?.data?.message ||
        "An error occurred during login. Please try again."
      );
    }
  };

  // Show loading spinner while checking authentication
  if (isCheckingAuth && isInitialCheck) {
    return (
      <div className="flex items-center justify-center min-h-screen" aria-busy="true" aria-label="Loading">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen grid lg:grid-cols-2">
      {/* Left Side - Login Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Welcome Message */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                aria-label="App logo"
              >
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
              <p className="text-base-content/60">Sign in to your account</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Login form">
            {/* Email Input */}
            <div className="form-control">
              <label className="label" htmlFor="email">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  id="email"
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  autoComplete="email"
                  aria-required="true"
                  aria-label="Email address"
                />
              </div>
            </div>

            {/* Password Input: Allows user to enter their password. Includes toggle for visibility. */}
            <div className="form-control">
              <label className="label" htmlFor="password">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  aria-required="true"
                  aria-label="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={0}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Eye className="h-5 w-5 text-base-content/40" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-center text-red-500 text-sm font-medium" role="alert">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoggingIn}
              aria-busy={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="text-center">
            <p className="text-base-content/60">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="link link-primary">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Decorative Image/Pattern */}
      <AuthImagePattern
        title={"Welcome back!"}
        subtitle={"Sign in to continue your conversations and catch up with your messages."}
      />
    </div>
  );
};

export default LoginPage;