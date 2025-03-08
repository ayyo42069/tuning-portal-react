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
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="w-6 h-6 mr-2 text-blue-500" />
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
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
              <div className="px-6 py-8 text-center">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  No transactions
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No transaction history available.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionBadgeClass(
                              transaction.transaction_type
                            )}`}
                          >
                            {transaction.transaction_type
                              .charAt(0)
                              .toUpperCase() +
                              transaction.transaction_type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {transaction.transaction_type === "purchase"
                            ? "+"
                            : "-"}
                          {transaction.amount}
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
