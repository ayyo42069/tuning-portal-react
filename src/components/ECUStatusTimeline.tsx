"use client";

import { CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";

interface StatusStep {
  status: "pending" | "processing" | "completed" | "failed";
  label: string;
  description: string;
  date?: string;
}

interface ECUStatusTimelineProps {
  currentStatus: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
  estimatedCompletionTime?: string;
  showRefreshButton?: boolean;
  onRefresh?: () => void;
}

export default function ECUStatusTimeline({
  currentStatus,
  createdAt,
  updatedAt,
  estimatedCompletionTime,
  showRefreshButton = false,
  onRefresh,
}: ECUStatusTimelineProps) {
  // Define the status steps
  const statusSteps: StatusStep[] = [
    {
      status: "pending",
      label: "Received",
      description: "Your ECU file has been received and is awaiting processing",
      date: createdAt,
    },
    {
      status: "processing",
      label: "Processing",
      description:
        "Your ECU file is currently being processed by our technicians",
      date:
        currentStatus === "processing" ||
        currentStatus === "completed" ||
        currentStatus === "failed"
          ? updatedAt
          : undefined,
    },
    {
      status: "completed",
      label: "Completed",
      description: "Your tuned ECU file is ready for download",
      date: currentStatus === "completed" ? updatedAt : undefined,
    },
  ];

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  // Helper function to determine if a step is active
  const isStepActive = (stepStatus: string) => {
    if (stepStatus === "pending") return true;
    if (
      stepStatus === "processing" &&
      (currentStatus === "processing" ||
        currentStatus === "completed" ||
        currentStatus === "failed")
    )
      return true;
    if (stepStatus === "completed" && currentStatus === "completed")
      return true;
    return false;
  };

  // Helper function to determine if a step is current
  const isStepCurrent = (stepStatus: string) => {
    if (currentStatus === "failed") return stepStatus === "processing";
    return stepStatus === currentStatus;
  };

  // Helper function to get step icon
  const getStepIcon = (step: StatusStep) => {
    if (isStepCurrent(step.status) && currentStatus === "failed") {
      return <AlertCircle className="w-8 h-8 text-red-500" />;
    }

    if (!isStepActive(step.status)) {
      return (
        <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
          <span className="text-gray-400 dark:text-gray-500">
            {statusSteps.indexOf(step) + 1}
          </span>
        </div>
      );
    }

    if (isStepCurrent(step.status)) {
      if (step.status === "pending") {
        return <Clock className="w-8 h-8 text-yellow-500" />;
      }
      if (step.status === "processing") {
        return <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />;
      }
      return <CheckCircle className="w-8 h-8 text-green-500" />;
    }

    return <CheckCircle className="w-8 h-8 text-green-500" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Processing Status
        </h3>
        {showRefreshButton && onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Refresh status"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-8">
        {statusSteps.map((step, index) => (
          <div key={step.status} className="relative">
            {/* Connector Line */}
            {index < statusSteps.length - 1 && (
              <div
                className={`absolute left-4 top-8 w-0.5 h-12 ${
                  isStepActive(step.status)
                    ? "bg-green-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              ></div>
            )}

            <div className="flex items-start">
              {/* Status Icon */}
              <div className="flex-shrink-0 mr-4">{getStepIcon(step)}</div>

              {/* Status Content */}
              <div className="flex-1">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">
                  {step.label}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {step.description}
                </p>
                {step.date && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatDate(step.date)}
                  </p>
                )}

                {/* Show estimated time for processing step */}
                {isStepCurrent(step.status) &&
                  step.status === "processing" &&
                  estimatedCompletionTime && (
                    <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                      Estimated completion: {estimatedCompletionTime}
                    </p>
                  )}

                {/* Show error message for failed status */}
                {isStepCurrent(step.status) && currentStatus === "failed" && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    There was an issue processing your file. Please check the
                    admin message for details.
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
