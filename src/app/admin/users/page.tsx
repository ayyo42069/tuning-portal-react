"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  UserCheck,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading users..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-6 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900/30 dark:text-red-400">
        {error}
        <button
          onClick={() => setError(null)}
          className="float-right text-red-800 dark:text-red-400"
        >
          &times;
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setSelectedUser(null)}
              className={`inline-flex items-center px-4 py-2 rounded-t-lg ${
                !selectedUser
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              All Users
            </button>
          </li>
          {selectedUser && (
            <li>
              <button className="inline-flex items-center px-4 py-2 rounded-t-lg border-b-2 border-blue-600 text-blue-600">
                <UserCheck className="w-5 h-5 mr-2" />
                User Details
              </button>
            </li>
          )}
        </ul>
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900/30 dark:text-red-400">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-800 dark:text-red-400"
          >
            &times;
          </button>
        </div>
      )}

      {selectedUser ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                User: {selectedUser.username}
              </h2>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Back to List
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
                User Information
              </h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Email:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedUser.email}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Role:
                  </span>
                  <span className="font-medium">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                        selectedUser.role === "admin"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {selectedUser.role}
                    </span>
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Credits:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedUser.credits}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Created:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDate(selectedUser.created_at)}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
                Update Role
              </h3>
              <div className="flex gap-2">
                <select
                  value={roleUpdate}
                  onChange={(e) => setRoleUpdate(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={() => handleRoleUpdate(selectedUser.id)}
                  disabled={!roleUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Adjust Credits
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amount:
                </label>
                <input
                  type="number"
                  value={creditAdjustment}
                  onChange={(e) => setCreditAdjustment(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount (positive or negative)"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reason:
                </label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Reason for adjustment"
                />
              </div>
            </div>

            <button
              onClick={() => handleCreditAdjustment(selectedUser.id)}
              disabled={!creditAdjustment || !adjustmentReason}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Adjust Credits
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                User List
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900">
                  <th className="p-3 text-left text-gray-600 dark:text-gray-400 font-medium">
                    ID
                  </th>
                  <th className="p-3 text-left text-gray-600 dark:text-gray-400 font-medium">
                    Username
                  </th>
                  <th className="p-3 text-left text-gray-600 dark:text-gray-400 font-medium">
                    Email
                  </th>
                  <th className="p-3 text-left text-gray-600 dark:text-gray-400 font-medium">
                    Role
                  </th>
                  <th className="p-3 text-left text-gray-600 dark:text-gray-400 font-medium">
                    Credits
                  </th>
                  <th className="p-3 text-left text-gray-600 dark:text-gray-400 font-medium">
                    Created
                  </th>
                  <th className="p-3 text-left text-gray-600 dark:text-gray-400 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr key="no-users">
                    <td
                      colSpan={7}
                      className="p-3 text-center text-gray-500 dark:text-gray-400"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr
                      key={`user-${user.id}-${index}`}
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
        </div>
      )}
    </div>
  );
}
