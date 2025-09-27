// Password change form component
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

const PasswordChangeForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { changePassword } = useAuthStore();

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (passwordStrength < 4) {
      setError("Password does not meet the strength requirements.");
      return;
    }
    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }}
   
  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm mb-1">Current Password</label>
        <input
          type="password"
          className="input input-bordered w-full"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm mb-1">New Password</label>
        <input
          type="password"
          className="input input-bordered w-full"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
        <div className="grid grid-cols-5 gap-2 mt-2">
          <div className={`h-2 rounded-full ${passwordStrength > 0 ? 'bg-success' : 'bg-base-300'}`}></div>
          <div className={`h-2 rounded-full ${passwordStrength > 1 ? 'bg-success' : 'bg-base-300'}`}></div>
          <div className={`h-2 rounded-full ${passwordStrength > 2 ? 'bg-warning' : 'bg-base-300'}`}></div>
          <div className={`h-2 rounded-full ${passwordStrength > 3 ? 'bg-warning' : 'bg-base-300'}`}></div>
          <div className={`h-2 rounded-full ${passwordStrength > 4 ? 'bg-error' : 'bg-base-300'}`}></div>
        </div>
        <ul className="text-xs text-base-content/60 mt-2 space-y-1">
          <li className={newPassword.length >= 8 ? 'text-success' : ''}>At least 8 characters</li>
          <li className={/[A-Z]/.test(newPassword) ? 'text-success' : ''}>At least one uppercase letter</li>
          <li className={/[a-z]/.test(newPassword) ? 'text-success' : ''}>At least one lowercase letter</li>
          <li className={/[0-9]/.test(newPassword) ? 'text-success' : ''}>At least one number</li>
          <li className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-success' : ''}>At least one special character</li>
        </ul>
      </div>
      <div>
        <label className="block text-sm mb-1">Confirm New Password</label>
        <input
          type="password"
          className="input input-bordered w-full"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm" aria-live="assertive">{error}</p>}
      {success && <p className="text-green-500 text-sm" aria-live="assertive">{success}</p>}
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={loading}
      >
        {loading ? "Changing..." : "Change Password"}
      </button>
    </form>
  );
};

export default PasswordChangeForm;


