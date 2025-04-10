"use client";

import { useState, useEffect } from "react";
import { Users, X, Ban, Shield, Search, RefreshCw } from "lucide-react";

interface Session {
  id: string;
  user_id: number;
  username: string;
  email: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  expires_at: string;
}

interface SessionViewerProps {
  onSessionTerminated?: () => void;
  onUserBanned?: () => void;
}

export default function SessionViewer({
  onSessionTerminated,
  onUserBanned,
}: SessionViewerProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalAction, setModalAction] = useState<"terminate" | "ban">(
    "terminate"
  );
  const [banReason, setBanReason] = useState<string>("");
  const [banDuration, setBanDuration] = useState<string>("permanent");

  // Fetch active sessions
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/security/sessions");

      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }

      const data = await response.json();
      setSessions(data.sessions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Terminate a session (and all other sessions for the same user)
  const terminateSession = async (sessionId: string) => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/security/sessions/${sessionId}`,
        {
          method: "DELETE",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to terminate session");
      }

      const result = await response.json();

      // Show success message with number of terminated sessions
      setError(null);
      setSuccessMessage(
        `Successfully terminated ${result.terminatedSessions} session(s) for user`
      );

      // Refresh sessions list
      fetchSessions();

      // Call the callback if provided
      if (onSessionTerminated) {
        onSessionTerminated();
      }

      setShowModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ban a user
  const banUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/security/users/${userId}/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: banReason,
          duration: banDuration,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to ban user");
      }

      // Refresh sessions list
      fetchSessions();

      // Call the callback if provided
      if (onUserBanned) {
        onUserBanned();
      }

      setShowModal(false);
      setBanReason("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Open modal for session termination
  const openTerminateModal = (session: Session) => {
    setSelectedSession(session);
    setModalAction("terminate");
    setShowModal(true);
  };

  // Open modal for user banning
  const openBanModal = (session: Session) => {
    setSelectedSession(session);
    setModalAction("ban");
    setShowModal(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Filter sessions based on search term
  const filteredSessions = sessions.filter(
    (session) =>
      session.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.ip_address.includes(searchTerm)
  );

  // Load sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Active Sessions
        </h3>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sessions..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={fetchSessions}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Refresh sessions"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900/30 dark:text-red-400">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-800 dark:text-red-400"
          >
            &times;
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-green-900/30 dark:text-green-400">
          {successMessage}
          <button
            onClick={() => setSuccessMessage(null)}
            className="float-right text-green-800 dark:text-green-400"
          >
            &times;
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading active sessions...
          </p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400">
            No active sessions found.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  User
                </th>
                <th scope="col" className="px-6 py-3">
                  IP Address
                </th>
                <th scope="col" className="px-6 py-3">
                  Created
                </th>
                <th scope="col" className="px-6 py-3">
                  Expires
                </th>
                <th scope="col" className="px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => (
                <tr
                  key={session.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {session.username}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {session.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">{session.ip_address}</td>
                  <td className="px-6 py-4">
                    {formatDate(session.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    {formatDate(session.expires_at)}
                  </td>
                  <td className="px-6 py-4 flex items-center space-x-2">
                    <button
                      onClick={() => openTerminateModal(session)}
                      className="font-medium text-red-600 dark:text-red-500 hover:underline flex items-center"
                      title="Terminate Session"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Terminate
                    </button>
                    <button
                      onClick={() => openBanModal(session)}
                      className="font-medium text-orange-600 dark:text-orange-500 hover:underline flex items-center"
                      title="Ban User"
                    >
                      <Ban className="w-4 h-4 mr-1" />
                      Ban
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for session termination or user banning */}
      {showModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                {modalAction === "terminate" ? "Terminate Session" : "Ban User"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              {modalAction === "terminate" ? (
                <p className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to terminate{" "}
                  <strong>all active sessions</strong> for user{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedSession.username}
                  </span>
                  ? This will force the user to log out from all devices and
                  require re-login.
                </p>
              ) : (
                <>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Are you sure you want to ban user{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedSession.username}
                    </span>
                    ? This will prevent the user from accessing the system.
                  </p>

                  <div className="mb-4">
                    <label
                      htmlFor="banReason"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Ban Reason
                    </label>
                    <textarea
                      id="banReason"
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter reason for banning"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="banDuration"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Ban Duration
                    </label>
                    <select
                      id="banDuration"
                      value={banDuration}
                      onChange={(e) => setBanDuration(e.target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="1_day">1 Day</option>
                      <option value="7_days">7 Days</option>
                      <option value="30_days">30 Days</option>
                      <option value="90_days">90 Days</option>
                      <option value="permanent">Permanent</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              {modalAction === "terminate" ? (
                <button
                  onClick={() => terminateSession(selectedSession.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
                >
                  <X className="w-4 h-4 inline mr-1" />
                  Terminate Session
                </button>
              ) : (
                <button
                  onClick={() => banUser(selectedSession.user_id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:bg-orange-700 dark:hover:bg-orange-800"
                  disabled={!banReason.trim()}
                >
                  <Ban className="w-4 h-4 inline mr-1" />
                  Ban User
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
