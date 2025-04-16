import { AlertTriangle } from "lucide-react";

interface ServerErrorProps {
  error: Error;
  reset: () => void;
}

export default function ServerError({ error, reset }: ServerErrorProps) {
  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
        <h3 className="text-red-800 dark:text-red-300 font-medium">
          Server Error
        </h3>
      </div>
      <p className="mt-2 text-sm text-red-700 dark:text-red-400">
        {error.message || "An unexpected error occurred on the server"}
      </p>
      <button
        onClick={reset}
        className="mt-3 px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded"
      >
        Try again
      </button>
    </div>
  );
} 