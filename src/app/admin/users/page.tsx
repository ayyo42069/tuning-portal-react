"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
  credits: number;
  created_at: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleUpdate, setRoleUpdate] = useState<string>("");
  const [creditAdjustment, setCreditAdjustment] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push("/auth/login");
          return;
        }
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError("Failed to load users. Please try again later.");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: number) => {
    if (!roleUpdate) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          role: roleUpdate,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update role: ${response.status}`);
      }

      // Refresh the list
      fetchUsers();
      setSelectedUser(null);
      setRoleUpdate("");
    } catch (err) {
      console.error("Error updating role:", err);
      setError("Failed to update role. Please try again.");
    }
  };

  const handleCreditAdjustment = async (userId: number) => {
    if (!creditAdjustment) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/credits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amount: creditAdjustment,
          reason: adjustmentReason,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to adjust credits: ${response.status}`);
      }

      // Refresh the list
      fetchUsers();
      setSelectedUser(null);
      setCreditAdjustment(0);
      setAdjustmentReason("");
    } catch (err) {
      console.error("Error adjusting credits:", err);
      setError("Failed to adjust credits. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading users...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">User Management</h1>

      {selectedUser ? (
        <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              User: {selectedUser.username}
            </h2>
            <button
              onClick={() => setSelectedUser(null)}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
            >
              Back to List
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium mb-2">User Information</h3>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Role:</strong> {selectedUser.role}
              </p>
              <p>
                <strong>Credits:</strong> {selectedUser.credits}
              </p>
              <p>
                <strong>Created:</strong> {formatDate(selectedUser.created_at)}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Update Role</h3>
              <div className="flex gap-2">
                <select
                  value={roleUpdate}
                  onChange={(e) => setRoleUpdate(e.target.value)}
                  className="flex-1 p-2 border border-input rounded-md bg-background"
                >
                  <option value="">Select Role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={() => handleRoleUpdate(selectedUser.id)}
                  disabled={!roleUpdate}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 disabled:opacity-50"
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-lg font-medium mb-2">Adjust Credits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Amount:</label>
                <input
                  type="number"
                  value={creditAdjustment}
                  onChange={(e) => setCreditAdjustment(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  placeholder="Enter amount (positive or negative)"
                />
              </div>

              <div>
                <label className="block mb-2">Reason:</label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  placeholder="Reason for adjustment"
                />
              </div>
            </div>

            <button
              onClick={() => handleCreditAdjustment(selectedUser.id)}
              disabled={!creditAdjustment || !adjustmentReason}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 disabled:opacity-50"
            >
              Adjust Credits
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Credits</th>
                <th className="p-3 text-left">Created</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-3 text-center">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="p-3">{user.id}</td>
                    <td className="p-3">{user.username}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          user.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">{user.credits}</td>
                    <td className="p-3">{formatDate(user.created_at)}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/80"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
