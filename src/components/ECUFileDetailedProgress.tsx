"use client";

import { useState } from "react";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ProgressStep {
  status: "pending" | "processing" | "completed" | "failed";
  label: string;
  description: string;
  date?: string;
  details?: string[];
}

interface ECUFileDetailedProgressProps {
  currentStatus: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
  estimatedCompletionTime?: string;
  priority?: number;
  showRefreshButton?: boolean;
  onRefresh?: () => void;
}

export default function ECUFileDetailedProgress({
  currentStatus,
  createdAt,
  updatedAt,
  estimatedCompletionTime,
  priority = 0,
  showRefreshButton = false,
  onRefresh,
}: ECUFileDetailedProgressProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(
    currentStatus
  );

  // Define the status steps with detailed information
  const statusSteps: ProgressStep[] = [
    {
      status: "pending",
      label: "Received",
      description: "Your ECU file has been received and is awaiting processing",
      date: createdAt,
      details: [
        "File has been uploaded successfully",
        "Credits have been deducted from your account",
        "File is in queue for processing",
        priority > 2
          ? "Your request has high priority"
          : priority > 0
          ? "Your request has medium priority"
          : "Your request has standard priority",
      ],
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
      details: [
        "A technician has been assigned to your file",
        "ECU data is being analyzed",
        "Tuning modifications are being applied",
        "Quality checks are being performed",
        estimatedCompletionTime
          ? `Estimated completion: ${estimatedCompletionTime}`
          : "Estimated completion time not yet available",
      ],
    },
    {
      status: "completed",
      label: "Completed",
      description: "Your tuned ECU file is ready for download",
      date: currentStatus === "completed" ? updatedAt : undefined,
      details: [
        "All requested tuning options have been applied",
        "Final quality checks have been completed",
        "File has been optimized for your vehicle",
        "Ready for download and installation",
      ],
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
  const getStepIcon = (step: ProgressStep) => {
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

  const toggleExpand = (status: string) => {
    if (expandedStep === status) {
      setExpandedStep(null);
    } else {
      setExpandedStep(status);
    }
  };

  const getPriorityBadge = () => {
    if (priority >= 3) {
      return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
    } else if (priority >= 1) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
    } else {
      return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
    }
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

      {priority > 0 && (
        <div className="mb-4 flex items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
            Priority:
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge()}`}
          >
            {priority >= 3 ? "High" : priority >= 1 ? "Medium" : "Low"}
          </span>
        </div>
      )}

      <div className="space-y-6">
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
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 -ml-2 rounded-lg transition-colors duration-200 ${
                    isStepCurrent(step.status)
                      ? "bg-blue-50/50 dark:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  }`}
                  onClick={() => toggleExpand(step.status)}
                >
                  <h4
                    className={`text-md font-medium ${
                      isStepCurrent(step.status)
                        ? "text-blue-700 dark:text-blue-300"
                        : isStepActive(step.status)
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.label}
                  </h4>
                  {step.details && (
                    <button
                      className={`p-1 rounded-full transition-colors duration-200 ${
                        isStepCurrent(step.status)
                          ? "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/30"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      {expandedStep === step.status ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>
                <p
                  className={`text-sm mt-1 ${
                    isStepCurrent(step.status)
                      ? "text-gray-700 dark:text-gray-300"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step.description}
                </p>
                {step.date && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center">
                    <Clock className="w-3 h-3 mr-1 inline" />{" "}
                    {formatDate(step.date)}
                  </p>
                )}

                {/* Show estimated time for processing step */}
                {isStepCurrent(step.status) &&
                  step.status === "processing" &&
                  estimatedCompletionTime && (
                    <div className="mt-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 dark:border-blue-600 rounded-r-md flex items-center">
                      <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400 mr-2" />
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Estimated completion:{" "}
                        <span className="font-medium">
                          {estimatedCompletionTime}
                        </span>
                      </p>
                    </div>
                  )}

                {/* Show error message for failed status */}
                {isStepCurrent(step.status) && currentStatus === "failed" && (
                  <div className="mt-2 px-3 py-2 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-600 rounded-r-md flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mr-2" />
                    <p className="text-xs text-red-700 dark:text-red-300">
                      There was an issue processing your file. Please check the
                      admin message for details.
                    </p>
                  </div>
                )}

                {/* Expanded details */}
                {expandedStep === step.status && step.details && (
                  <div className="mt-3 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                    <ul className="space-y-1">
                      {step.details.map((detail, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-600 dark:text-gray-400 flex items-center"
                        >
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
