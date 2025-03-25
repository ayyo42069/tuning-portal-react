"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import CreditPurchaseForm from "../components/CreditPurchaseForm";
import LoadingSpinner from "@/components/LoadingSpinner";

interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
  credits?: number;
}

interface CreditTransaction {
  id: number;
  amount: number;
  transaction_type: "purchase" | "usage";
  created_at: string;
}

export default function CreditsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user data and credit transactions
    const fetchData = async () => {
      try {
        // Fetch user profile
        const userResponse = await fetch("/api/user/profile", {
          credentials: "include",
        });

        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push("/auth/login");
            return;
          }
          throw new Error(`Failed to fetch user data: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        setUser(userData.user);

        // Fetch credit transactions
        const transactionsResponse = await fetch("/api/credits/transactions", {
          credentials: "include",
        });

        if (!transactionsResponse.ok) {
          throw new Error(
            `Failed to fetch transactions: ${transactionsResponse.status}`
          );
        }

        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load credit information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTransactionBadgeClass = (type: string) => {
    return type === "purchase"
      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
      : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading credit information..." />
      </div>
    );
  }

  return (
    <main>
      <div className="space-y-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-md">
            <p>{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Credit Purchase Form */}
          <CreditPurchaseForm />

          {/* Transaction History */}
          <div className="bg-white/80 dark:bg-gray-800/80 shadow-xl rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 backdrop-filter backdrop-blur-md">
            {/* Background gradient and pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-purple-900/10 dark:from-indigo-900/20 dark:to-purple-900/20 -z-10 overflow-hidden">
              <div
                className="absolute inset-0 opacity-5 dark:opacity-10"
                style={{
                  backgroundImage: "url('/patterns/circuit-board.svg')",
                  backgroundSize: "300px",
                }}
              ></div>
            </div>

            <div className="px-6 py-5 border-b border-gray-200/70 dark:border-gray-700/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg mr-3">
                    <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                      Transaction History
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                      Your credit purchase and usage history
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="p-4 bg-indigo-100/50 dark:bg-indigo-900/30 rounded-full inline-flex items-center justify-center mb-4">
                  <CreditCard className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                  No transactions
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Your transaction history will appear here once you purchase or
                  use credits.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto p-1">
                <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  <thead className="bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        <div className="flex items-center space-x-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-indigo-500 dark:text-indigo-400"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span>Date</span>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        <div className="flex items-center space-x-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-indigo-500 dark:text-indigo-400"
                          >
                            <path d="M12 2H2v10h10V2z" />
                            <path d="M12 12H2v10h10V12z" />
                            <path d="M22 2h-10v20h10V2z" />
                          </svg>
                          <span>Type</span>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        <div className="flex items-center space-x-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-indigo-500 dark:text-indigo-400"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                            <path d="M12 18V6" />
                          </svg>
                          <span>Amount</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm divide-y divide-gray-200/50 dark:divide-gray-700/50">
                    {transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {transaction.transaction_type === "purchase" ? (
                            <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-800/70 dark:to-emerald-800/70 dark:text-green-100 border border-green-200/50 dark:border-green-700/50">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-1"
                              >
                                <path d="M12 2v20" />
                                <path d="M17 5H7.5a3.5 3.5 0 0 0 0 7h9a3.5 3.5 0 0 1 0 7H7" />
                              </svg>
                              Purchase
                            </span>
                          ) : (
                            <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-red-100 to-rose-100 text-red-800 dark:from-red-800/70 dark:to-rose-800/70 dark:text-red-100 border border-red-200/50 dark:border-red-700/50">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-1"
                              >
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                              </svg>
                              Usage
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span
                            className={
                              transaction.transaction_type === "purchase"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }
                          >
                            {transaction.transaction_type === "purchase"
                              ? "+"
                              : "-"}
                            {transaction.amount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
