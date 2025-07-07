// components/modals/AddUserModal.tsx
import React from 'react';

const AddUserModal = ({ open, onClose, newUser, setNewUser, onSubmit, loading }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-base-100 p-6 rounded-xl shadow-lg w-[90%] max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add New Employee</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              required
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-base-200 text-base-content"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-base-200 text-base-content"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-base-200 text-base-content"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-base-300 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-primary text-white text-sm">
              {loading ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
