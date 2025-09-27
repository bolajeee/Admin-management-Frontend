import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";

export const ProfileUpdateForm = () => {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const [name, setName] = useState(authUser?.name || "");
  const [email, setEmail] = useState(authUser?.email || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({ name, email });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm mb-1">Name</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          className="input input-bordered w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isUpdatingProfile}
      >
        {isUpdatingProfile ? "Updating..." : "Update Profile"}
      </button>
    </form>
  );
};

export default ProfileUpdateForm;
