"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Filter,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface CreditTransaction {
  id: number;
  user_id: number;
  username: string;
  amount: number;
  transaction_type: "purchase" | "usage" | "adjustment";
  reason: string | null;
  created_at: string;
}

export default function CreditsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchTransactions();
  }, [filter, dateRange]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("type", filter);
      }
      if (dateRange.start) {
        params.append("start_date", dateRange.start);
      }
      if (dateRange.end) {
        params.append("end_date", dateRange.end);
      }

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const response = await fetch(`/api/admin/credits${queryString}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push("/auth/login");
          return;
        }
        throw new Error(
          `Failed to fetch credit transactions: ${response.status}`
        );
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError("Failed to load credit transactions. Please try again later.");
      console.error("Error fetching credit transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "purchase":
        return {
          label: "Purchase",
          className:
            "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
        };
      case "usage":
        return {
          label: "Usage",
          className:
            "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
        };
      case "adjustment":
        return {
          label: "Adjustment",
          className:
            "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
        };
      default:
        return {
          label: type,
          className:
            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
        };
    }
  };

  const getTotalCredits = () => {
    return transactions.reduce((total, transaction) => {
      if (
        transaction.transaction_type === "purchase" ||
        (transaction.transaction_type === "adjustment" &&
          transaction.amount > 0)
      ) {
        return total + transaction.amount;
      } else {
        return total - Math.abs(transaction.amount);
      }
    }, 0);
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading credit transactions..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button className="inline-flex items-center px-4 py-2 rounded-t-lg border-b-2 border-blue-600 text-blue-600">
              <CreditCard className="w-5 h-5 mr-2" />
              Credit Transactions
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

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Filter className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Filters
          </h2>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">
                Transaction Type
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Transactions</option>
                <option value="purchase">Purchases</option>
                <option value="usage">Usage</option>
                <option value="adjustment">Adjustments</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Total Credits (filtered):
              </span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {getTotalCredits()}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <th className="p-3 text-left text-gray-600 dark:text-gray-400 font-medium">
                  ID
                </th>
                <th className="p-3 text-left text-gray-600 dark:text-gray-400 font-medium">
                  User
                </th>
                <th className="p-3 text-left text-gray-600 dark:text-gray-400 font-medium">
                  Type
                </th>
                <th className="p-3 text-left text-gray-600 dark:text-gray-400 font-medium">
                  Amount
                </th>
                <th className="p-3 text-left text-gray-600 dark:text-gray-400 font-medium">
                  Reason
                </th>
                <th className="p-3 text-left text-gray-600 dark:text-gray-400 font-medium">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-3 text-center text-gray-500 dark:text-gray-400"
                  >
                    No credit transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => {
                  const typeInfo = getTransactionTypeLabel(
                    transaction.transaction_type
                  );
                  return (
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <td className="p-3 text-gray-900 dark:text-white">
                        {transaction.id}
                      </td>
                      <td className="p-3 text-gray-900 dark:text-white">
                        {transaction.username}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${typeInfo.className}`}
                        >
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={
                            transaction.amount >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {transaction.amount >= 0 ? "+" : ""}
                          {transaction.amount}
                        </span>
                      </td>
                      <td className="p-3 text-gray-900 dark:text-white">
                        {transaction.reason || "-"}
                      </td>
                      <td className="p-3 text-gray-900 dark:text-white">
                        {formatDate(transaction.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
