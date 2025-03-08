"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8 text-foreground">
          Credit Transactions
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-400 dark:border-red-400/50 text-red-700 dark:text-red-400 rounded-md">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold">Filters</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">
                  Transaction Type
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="p-2 border border-input rounded-md bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <option value="all">All Transactions</option>
                  <option value="purchase">Purchases</option>
                  <option value="usage">Usage</option>
                  <option value="adjustment">Adjustments</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="p-2 border border-input rounded-md bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="p-2 border border-input rounded-md bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                />
              </div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-muted/50 dark:bg-muted/20 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-medium text-muted-foreground">
                Total Credits (filtered):
              </span>
              <span className="text-xl font-bold text-foreground">
                {getTotalCredits()}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50 dark:bg-muted/20">
                  <th className="p-3 text-left text-muted-foreground font-medium">
                    ID
                  </th>
                  <th className="p-3 text-left text-muted-foreground font-medium">
                    User
                  </th>
                  <th className="p-3 text-left text-muted-foreground font-medium">
                    Type
                  </th>
                  <th className="p-3 text-left text-muted-foreground font-medium">
                    Amount
                  </th>
                  <th className="p-3 text-left text-muted-foreground font-medium">
                    Reason
                  </th>
                  <th className="p-3 text-left text-muted-foreground font-medium">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-3 text-center text-muted-foreground"
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
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-3 text-foreground">
                          {transaction.id}
                        </td>
                        <td className="p-3 text-foreground">
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
                        <td className="p-3 text-foreground">
                          {transaction.reason || "-"}
                        </td>
                        <td className="p-3 text-foreground">
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
    </div>
  );
}
