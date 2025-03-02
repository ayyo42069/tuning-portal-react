'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CreditPurchaseForm from '../components/CreditPurchaseForm';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  credits?: number;
}

interface CreditTransaction {
  id: number;
  amount: number;
  transaction_type: 'purchase' | 'usage';
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
        const userResponse = await fetch('/api/user/profile', {
          credentials: 'include',
        });

        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push('/auth/login');
            return;
          }
          throw new Error(`Failed to fetch user data: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        setUser(userData.user);

        // Fetch credit transactions
        const transactionsResponse = await fetch('/api/credits/transactions', {
          credentials: 'include',
        });

        if (!transactionsResponse.ok) {
          throw new Error(`Failed to fetch transactions: ${transactionsResponse.status}`);
        }

        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load credit information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manage Credits
          </h1>
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
              <p>{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Credit Purchase Form */}
            <CreditPurchaseForm />

            {/* Transaction History */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Transaction History</h3>
              
              {transactions.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No transaction history available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {transaction.transaction_type === 'purchase' ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                Purchase
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                                Usage
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {transaction.transaction_type === 'purchase' ? '+' : '-'}{transaction.amount}
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
    </div>
  );
}