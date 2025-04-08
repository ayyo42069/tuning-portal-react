"use client";

import { useState, useEffect } from "react";
import SessionViewer from "@/components/admin/SessionViewer";
import {
  Shield,
  AlertTriangle,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Check,
  Users,
} from "lucide-react";
import {
  SecurityEventType,
  SecurityEventSeverity,
} from "@/lib/securityLogging";
import Link from "next/link";

// Define interfaces for the component
interface SecurityLog {
  id: number;
  user_id?: number;
  username?: string;
  email?: string;
  event_type: string;
  severity: string;
  ip_address: string;
  user_agent: string;
  details?: any;
  created_at: string;
}

interface SecurityAlert {
  id: number;
  event_id: number;
  user_id?: number;
  username?: string;
  email?: string;
  alert_type: string;
  severity: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
  event_type: string;
  ip_address: string;
}

interface SecurityStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  recentFailedLogins: number;
  recentSuspiciousActivities: number;
}

export default function SecurityDashboard() {
  // State for security logs, alerts, and stats
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for pagination
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [totalLogs, setTotalLogs] = useState<number>(0);

  // State for filters
  const [filters, setFilters] = useState({
    eventType: "",
    severity: "",
    userId: "",
    startDate: "",
    endDate: "",
  });

  // State for time range
  const [timeRange, setTimeRange] = useState<number>(30); // days

  // State for active tab
  const [activeTab, setActiveTab] = useState<
    "overview" | "logs" | "alerts" | "sessions"
  >("overview");

  // Fetch security stats
  const fetchSecurityStats = async () => {
    try {
      const response = await fetch(
        `/api/admin/security/stats?days=${timeRange}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch security statistics");
      }
      const data = await response.json();
      setStats(data.stats);
      setAlerts(data.unresolvedAlerts);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Fetch security logs
  const fetchSecurityLogs = async () => {
    try {
      setLoading(true);

      // Build query string from filters
      const queryParams = new URLSearchParams();
      queryParams.append("limit", limit.toString());
      queryParams.append("offset", ((page - 1) * limit).toString());

      if (filters.eventType) queryParams.append("eventType", filters.eventType);
      if (filters.severity) queryParams.append("severity", filters.severity);
      if (filters.userId) queryParams.append("userId", filters.userId);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const response = await fetch(
        `/api/admin/security/logs?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch security logs");
      }
      const data = await response.json();

      console.log("Security logs API response:", data);

      // Check if data.logs exists and is an array
      if (data.logs && Array.isArray(data.logs)) {
        console.log(`Received ${data.logs.length} security logs from API`);
        setLogs(data.logs);
        setTotalLogs(data.total || data.logs.length); // Use total if provided, otherwise use length
      } else {
        console.error(
          "No logs data returned from API or invalid format:",
          data
        );
        setLogs([]);
        setTotalLogs(0);
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching security logs:", err);
      setLogs([]);
      setTotalLogs(0);
    } finally {
      setLoading(false);
    }
  };

  // Resolve a security alert
  const resolveAlert = async (alertId: number) => {
    try {
      const notes = prompt("Enter resolution notes:");
      if (!notes) return; // User cancelled

      const response = await fetch("/api/admin/security/alerts/resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alertId, notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to resolve alert");
      }

      // Refresh alerts after resolution
      fetchSecurityStats();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle filter changes
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    setPage(1); // Reset to first page
    fetchSecurityLogs();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      eventType: "",
      severity: "",
      userId: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
    fetchSecurityLogs();
  };

  // Handle time range change
  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(parseInt(e.target.value));
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get severity class for styling
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "error":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchSecurityStats();
    fetchSecurityLogs();
  }, []);

  // Reload stats when time range changes
  useEffect(() => {
    fetchSecurityStats();
  }, [timeRange]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`inline-flex items-center px-4 py-2 rounded-t-lg ${
                activeTab === "overview"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <Shield className="w-5 h-5 mr-2" />
              Overview
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab("logs")}
              className={`inline-flex items-center px-4 py-2 rounded-t-lg ${
                activeTab === "logs"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <Clock className="w-5 h-5 mr-2" />
              Security Logs
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("alerts")}
              className={`inline-flex items-center px-4 py-2 rounded-t-lg ${
                activeTab === "alerts"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              Active Alerts
              {alerts.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                  {alerts.length}
                </span>
              )}
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("sessions")}
              className={`inline-flex items-center px-4 py-2 rounded-t-lg ${
                activeTab === "sessions"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              User Sessions
            </button>
          </li>
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

      {/* Overview Tab */}
      {activeTab === "overview" && stats && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Security Overview
            </h2>
            <div className="flex items-center">
              <label className="mr-2 text-sm text-gray-600 dark:text-gray-400">
                Time Range:
              </label>
              <select
                value={timeRange}
                onChange={handleTimeRangeChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="1">Last 24 Hours</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Events Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  Total Events
                </h3>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {stats.totalEvents}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                In the last {timeRange} days
              </p>
            </div>

            {/* Failed Logins Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  Failed Logins
                </h3>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {stats.recentFailedLogins}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                In the last 24 hours
              </p>
            </div>

            {/* Suspicious Activities Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  Suspicious Activities
                </h3>
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {stats.recentSuspiciousActivities}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                In the last 24 hours
              </p>
            </div>

            {/* Active Alerts Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  Active Alerts
                </h3>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {alerts.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Unresolved security alerts
              </p>
            </div>
          </div>

          {/* Event Distribution Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Events by Type */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                Events by Type
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.eventsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{
                          width: `${(count / stats.totalEvents) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between w-full">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {type.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Events by Severity */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                Events by Severity
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.eventsBySeverity).map(
                  ([severity, count]) => {
                    let barColor = "";
                    switch (severity) {
                      case "critical":
                        barColor = "bg-red-600";
                        break;
                      case "error":
                        barColor = "bg-orange-600";
                        break;
                      case "warning":
                        barColor = "bg-yellow-600";
                        break;
                      default:
                        barColor = "bg-blue-600";
                    }
                    return (
                      <div key={severity} className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                          <div
                            className={`${barColor} h-2.5 rounded-full`}
                            style={{
                              width: `${(count / stats.totalEvents) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between w-full">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {severity}
                          </span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          {alerts.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 mb-8">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                Recent Security Alerts
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Alert
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Severity
                      </th>
                      <th scope="col" className="px-6 py-3">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Time
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.slice(0, 5).map((alert) => (
                      <tr
                        key={alert.id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                      >
                        <td className="px-6 py-4">{alert.message}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getSeverityClass(
                              alert.severity
                            )}`}
                          >
                            {alert.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4">{alert.username || "N/A"}</td>
                        <td className="px-6 py-4">
                          {formatDate(alert.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                          >
                            Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {alerts.length > 5 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setActiveTab("alerts")}
                    className="text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  >
                    View all {alerts.length} alerts
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Security Logs Tab */}
      {activeTab === "logs" && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Security Event Logs
            </h2>
            <div className="mt-2 mb-4">
              <Link
                href="/admin/security/direct"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <Shield className="w-4 h-4 mr-1" />
                Try Direct API Version
              </Link>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 mb-6">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Event Type
                  </label>
                  <select
                    name="eventType"
                    value={filters.eventType}
                    onChange={handleFilterChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">All Types</option>
                    {Object.values(SecurityEventType).map((type) => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Severity
                  </label>
                  <select
                    name="severity"
                    value={filters.severity}
                    onChange={handleFilterChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">All Severities</option>
                    {Object.values(SecurityEventSeverity).map((severity) => (
                      <option key={severity} value={severity}>
                        {severity}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    name="userId"
                    value={filters.userId}
                    onChange={handleFilterChange}
                    placeholder="Enter user ID"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={applyFilters}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                  >
                    <Filter className="w-4 h-4 inline mr-1" />
                    Filter
                  </button>
                  <button
                    onClick={resetFilters}
                    className="text-gray-500 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 focus:outline-none dark:focus:ring-gray-600"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Logs Table */}
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Loading security logs...
                </p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">
                  No security logs found matching your criteria.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Event Type
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Severity
                        </th>
                        <th scope="col" className="px-6 py-3">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3">
                          IP Address
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Time
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr
                          key={log.id}
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                        >
                          <td className="px-6 py-4">
                            {log.event_type.replace(/_/g, " ")}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getSeverityClass(
                                log.severity
                              )}`}
                            >
                              {log.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4">{log.username || "N/A"}</td>
                          <td className="px-6 py-4">{log.ip_address}</td>
                          <td className="px-6 py-4">
                            {formatDate(log.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() =>
                                alert(JSON.stringify(log.details, null, 2))
                              }
                              className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3">
                  <div className="flex items-center">
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                        fetchSecurityLogs();
                      }}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                      <option value="100">100 per page</option>
                    </select>
                    <span className="text-sm text-gray-700 dark:text-gray-400 ml-4">
                      Showing{" "}
                      <span className="font-medium">
                        {(page - 1) * limit + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(page * limit, totalLogs)}
                      </span>{" "}
                      of <span className="font-medium">{totalLogs}</span>{" "}
                      results
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        if (page > 1) {
                          setPage(page - 1);
                          fetchSecurityLogs();
                        }
                      }}
                      disabled={page === 1}
                      className={`p-2 rounded-lg ${
                        page === 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-400">
                      Page {page}
                    </span>
                    <button
                      onClick={() => {
                        if (page * limit < totalLogs) {
                          setPage(page + 1);
                          fetchSecurityLogs();
                        }
                      }}
                      disabled={page * limit >= totalLogs}
                      className={`p-2 rounded-lg ${
                        page * limit >= totalLogs
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === "sessions" && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Active User Sessions
            </h2>

            {/* Import the SessionViewer component */}
            <div className="mt-4">
              {/* @ts-ignore */}
              <SessionViewer
                onSessionTerminated={() => {
                  // Refresh security stats when a session is terminated
                  fetchSecurityStats();
                }}
                onUserBanned={() => {
                  // Refresh security stats when a user is banned
                  fetchSecurityStats();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Active Security Alerts
            </h2>

            {alerts.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                  All Clear!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  There are no active security alerts at this time.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Alert Type
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Message
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Severity
                        </th>
                        <th scope="col" className="px-6 py-3">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3">
                          IP Address
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Time
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map((alert) => (
                        <tr
                          key={alert.id}
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                        >
                          <td className="px-6 py-4">
                            {alert.alert_type.replace(/_/g, " ")}
                          </td>
                          <td className="px-6 py-4">{alert.message}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getSeverityClass(
                                alert.severity
                              )}`}
                            >
                              {alert.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {alert.username || "N/A"}
                          </td>
                          <td className="px-6 py-4">{alert.ip_address}</td>
                          <td className="px-6 py-4">
                            {formatDate(alert.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => resolveAlert(alert.id)}
                              className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                            >
                              Resolve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
