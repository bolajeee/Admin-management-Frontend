import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";
import toast from "react-hot-toast";
import PasswordChangeForm from "../components/PasswordChangeForm";



/**
 * ProfilePage - Displays and allows editing of the user's profile information.
 *
 * Features:
 * - Shows user's avatar, name, email, and account info.
 * - Allows user to upload a new profile picture.
 * - Shows upload progress and disables input while uploading.
 * - Responsive and accessible layout.
 */
const ProfilePage = () => {
  // Get user info and update actions from auth store
  const { authUser, isUpdatingProfile, updateProfile, isCheckingAuth, checkAuth } = useAuthStore();
  // Fetch user data on mount
  useEffect(() => {
    checkAuth();
  }, []);
  // State for previewing selected image
  const [selectedImg, setSelectedImg] = useState(null);

  /**
   * Handles image upload for profile picture.
   * - Shows preview of selected image.
   * - Sends image to backend for update.
   */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImg(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("profilePic", file);
    updateProfile(formData);
  };

  if (isCheckingAuth || !authUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          {/* Header: Profile title and description */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* Avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser?.profilePicture || "/avatar.png"}
                alt="Profile avatar"
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}`}
                aria-label="Upload profile picture"
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                  aria-disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* User info section */}
          <div className="space-y-6">
            {/* Full Name */}
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border" aria-label="Full name">{authUser?.name}</p>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border" aria-label="Email address">{authUser?.email}</p>
            </div>
          </div>

          {/* Account Information */}
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="mt-8">
              <h2 className="text-lg font-medium mb-2">Change Password</h2>
              <PasswordChangeForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;