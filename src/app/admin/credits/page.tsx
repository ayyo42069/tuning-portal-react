'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CreditTransaction {
  id: number;
  user_id: number;
  username: string;
  amount: number;
  transaction_type: 'purchase' | 'usage' | 'adjustment';
  reason: string | null;
  created_at: string;
}

export default function CreditsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{start: string; end: string}>({ 
    start: '', 
    end: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => {
    fetchTransactions();
  }, [filter, dateRange]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('type', filter);
      }
      if (dateRange.start) {
        params.append('start_date', dateRange.start);
      }
      if (dateRange.end) {
        params.append('end_date', dateRange.end);
      }
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/admin/credits${queryString}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/auth/login');
          return;
        }
        throw new Error(`Failed to fetch credit transactions: ${response.status}`);
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError('Failed to load credit transactions. Please try again later.');
      console.error('Error fetching credit transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return {
          label: 'Purchase',
          className: 'bg-green-100 text-green-800'
        };
      case 'usage':
        return {
          label: 'Usage',
          className: 'bg-red-100 text-red-800'
        };
      case 'adjustment':
        return {
          label: 'Adjustment',
          className: 'bg-blue-100 text-blue-800'
        };
      default:
        return {
          label: type,
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const getTotalCredits = () => {
    return transactions.reduce((total, transaction) => {
      if (transaction.transaction_type === 'purchase' || transaction.transaction_type === 'adjustment' && transaction.amount > 0) {
        return total + transaction.amount;
      } else {
        return total - Math.abs(transaction.amount);
      }
    }, 0);
  };

  if (loading && transactions.length === 0) {
    return <div className="flex justify-center p-8">Loading credit transactions...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Credit Transactions</h1>

      <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold">Filters</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm mb-1">Transaction Type</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="p-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Transactions</option>
                <option value="purchase">Purchases</option>
                <option value="usage">Usage</option>
                <option value="adjustment">Adjustments</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="p-2 border border-input rounded-md bg-background"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="p-2 border border-input rounded-md bg-background"
              />
            </div>
          </div>
        </div>

        <div className="mb-4 p-4 bg-muted rounded-md">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Credits (filtered):</span>
            <span className="text-xl font-bold">{getTotalCredits()}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Reason</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-3 text-center">
                    No credit transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => {
                  const typeInfo = getTransactionTypeLabel(transaction.transaction_type);
                  return (
                    <tr key={transaction.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-3">{transaction.id}</td>
                      <td className="p-3">{transaction.username}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${typeInfo.className}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                        </span>
                      </td>
                      <td className="p-3">{transaction.reason || '-'}</td>
                      <td className="p-3">{formatDate(transaction.created_at)}</td>
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