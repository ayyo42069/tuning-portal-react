import { CreditCard } from "lucide-react";

export default function CreditsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Credits Management
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage credit transactions and user balances
        </p>
      </div>
      {children}
    </div>
  );
}
