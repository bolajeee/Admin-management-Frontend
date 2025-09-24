import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [isInitialCheck, setIsInitialCheck] = useState(true);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const { login, isLoggingIn, authUser, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    if (isInitialCheck) {
      setIsInitialCheck(false);
      return;
    }
    if (authUser?.role && !isCheckingAuth) {
      authUser.role === "admin"
        ? navigate("/admin/dashboard")
        : navigate(from);
    }
  }, [authUser, isCheckingAuth, isInitialCheck, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const success = await login(formData);
      if (!success) {
        setError("Login failed. Please check your credentials.");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "An error occurred during login. Please try again."
      );
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsSendingPasswordReset(true);
    try {
      await axiosInstance.post("/auth/forgot-password", { email: forgotPasswordEmail });
      toast.success("An email has been sent with instructions to reset your password.");
      setShowForgotPasswordModal(false);
      setForgotPasswordEmail("");
    } catch (error) {
      toast.error("Failed to send password reset email. Please try again.");
    } finally {
      setIsSendingPasswordReset(false);
    }
  };

  if (isCheckingAuth && isInitialCheck) {
    return (
      <div className="flex items-center justify-center min-h-screen" aria-busy="true" aria-label="Loading">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
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

          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Login form">
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

            {error && (
              <div className="text-center text-red-500 text-sm font-medium" role="alert">
                {error}
              </div>
            )}

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

          <div className="text-center">
            <p className="text-base-content/60">
              <a href="#" className="link link-primary" onClick={(e) => {e.preventDefault(); setShowForgotPasswordModal(true);}}>
                Forgot Password?
              </a>
            </p>
          </div>

          <div className="text-center">
            <p className="text-base-content/60">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="link link-primary">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <AuthImagePattern
        title={"Welcome back!"}
        subtitle={"Sign in to continue your conversations and catch up with your messages."}
      />

      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-base-100 text-base-content p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <button
              type="button"
              className="absolute top-3 right-3 text-base-content hover:text-error focus:outline-none"
              aria-label="Close modal"
              onClick={() => setShowForgotPasswordModal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="forgot-password-email">Email</label>
                <input
                  id="forgot-password-email"
                  type="email"
                  required
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Enter your email"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowForgotPasswordModal(false)}
                  disabled={isSendingPasswordReset}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSendingPasswordReset}>
                  {isSendingPasswordReset ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
