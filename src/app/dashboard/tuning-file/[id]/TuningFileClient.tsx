'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Download, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useFeedback } from '@/lib/FeedbackProvider';
import ECUFileDetailedProgress from '@/components/ECUFileDetailedProgress';
import ECUFileComments from '@/components/ECUFileComments';

interface TuningOption {
  id: number;
  name: string;
  description: string;
  credit_cost: number;
}

interface TuningFileDetails {
  id: number;
  file_name: string;
  original_filename: string;
  stored_filename: string;
  processed_filename: string | null;
  vehicle_info: string;
  manufacturer_name: string;
  model_name: string;
  production_year: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  credits_used: number;
  admin_message: string | null;
  priority: number;
  tuning_options: TuningOption[];
  user_id: number;
}

interface TuningFileClientProps {
  tuningFile: TuningFileDetails;
}

export default function TuningFileClient({ tuningFile }: TuningFileClientProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const { showFeedback: showFeedbackToast } = useFeedback();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-yellow-100/80 to-amber-100/80 text-yellow-800 dark:from-yellow-800/30 dark:to-amber-800/30 dark:text-yellow-100 backdrop-blur-sm";
      case "processing":
        return "bg-gradient-to-r from-blue-100/80 to-indigo-100/80 text-blue-800 dark:from-blue-800/30 dark:to-indigo-800/30 dark:text-blue-100 backdrop-blur-sm";
      case "completed":
        return "bg-gradient-to-r from-green-100/80 to-emerald-100/80 text-green-800 dark:from-green-800/30 dark:to-emerald-800/30 dark:text-green-100 backdrop-blur-sm";
      case "failed":
        return "bg-gradient-to-r from-red-100/80 to-rose-100/80 text-red-800 dark:from-red-800/30 dark:to-rose-800/30 dark:text-red-100 backdrop-blur-sm";
      default:
        return "bg-gradient-to-r from-gray-100/80 to-slate-100/80 text-gray-800 dark:from-gray-800/30 dark:to-slate-800/30 dark:text-gray-100 backdrop-blur-sm";
    }
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    showFeedbackToast({
      type: 'success',
      message: `Thank you for your ${type} feedback!`,
      duration: 3000,
    });
    setShowFeedback(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 dark:from-blue-950 dark:to-blue-900 relative overflow-hidden">
      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="px-4 py-6 sm:px-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm shadow-xl overflow-hidden sm:rounded-xl border border-white/10 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300"
          >
            <div className="px-6 py-6 sm:px-8 flex justify-between items-center border-b border-white/10 dark:border-gray-700/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-900/30 dark:to-cyan-900/30 backdrop-blur-sm">
              <div>
                <h3 className="text-xl leading-6 font-medium text-gray-900 dark:text-white">
                  {tuningFile.file_name}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
                  Uploaded on {formatDate(tuningFile.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-4 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full shadow-sm backdrop-blur-sm ${getStatusBadgeClass(
                    tuningFile.status
                  )}`}
                >
                  {tuningFile.status.charAt(0).toUpperCase() +
                    tuningFile.status.slice(1)}
                </span>
                {tuningFile.status === 'completed' && (
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="p-2 rounded-full bg-white/10 dark:bg-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-600/40 transition-all duration-200"
                  >
                    <Star className="w-5 h-5 text-yellow-400" />
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-white/10 dark:border-gray-700/30">
              <dl className="divide-y divide-white/10 dark:divide-gray-700/30">
                <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 backdrop-blur-sm bg-white/5 dark:bg-gray-800/20 hover:bg-white/10 dark:hover:bg-gray-700/30 transition-all duration-200">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Vehicle Information
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2 font-medium">
                    {tuningFile.manufacturer_name} {tuningFile.model_name},
                    Year: {tuningFile.production_year}
                  </dd>
                </div>
                <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 backdrop-blur-sm bg-white/10 dark:bg-gray-800/30 hover:bg-white/15 dark:hover:bg-gray-700/40 transition-all duration-200">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Status
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2 font-medium">
                    {tuningFile.status.charAt(0).toUpperCase() +
                      tuningFile.status.slice(1)}
                  </dd>
                </div>
                <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 backdrop-blur-sm bg-white/5 dark:bg-gray-800/20 hover:bg-white/10 dark:hover:bg-gray-700/30 transition-all duration-200">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Last Updated
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2 font-medium">
                    {formatDate(tuningFile.updated_at)}
                  </dd>
                </div>
                <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 backdrop-blur-sm bg-white/10 dark:bg-gray-800/30 hover:bg-white/15 dark:hover:bg-gray-700/40 transition-all duration-200">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Credits Used
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2 font-medium">
                    {tuningFile.credits_used}
                  </dd>
                </div>
                {tuningFile.admin_message && (
                  <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 backdrop-blur-sm bg-white/5 dark:bg-gray-800/20 hover:bg-white/10 dark:hover:bg-gray-700/30 transition-all duration-200">
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Admin Message
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2 font-medium">
                      {tuningFile.admin_message}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Tuning Options */}
            <div className="px-6 py-6 sm:px-8 border-t border-white/10 dark:border-gray-700/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/30 dark:to-purple-900/30 backdrop-blur-sm">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Tuning Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tuningFile.tuning_options.map((option) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 dark:border-gray-700/30 hover:bg-white/10 dark:hover:bg-gray-700/30 transition-all duration-200"
                  >
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {option.name}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {option.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {option.credit_cost} credits
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Progress and Comments */}
            <div className="px-6 py-6 sm:px-8 border-t border-white/10 dark:border-gray-700/30">
              <ECUFileDetailedProgress 
                currentStatus={tuningFile.status}
                createdAt={tuningFile.created_at}
                updatedAt={tuningFile.updated_at}
                priority={tuningFile.priority}
                showRefreshButton={true}
                onRefresh={() => window.location.reload()}
              />
              <div className="mt-6">
                <ECUFileComments 
                  fileId={tuningFile.id}
                  currentUserId={tuningFile.user_id}
                  currentUserRole="user"
                />
              </div>
            </div>

            {/* Download Button */}
            {tuningFile.status === 'completed' && tuningFile.processed_filename && (
              <div className="px-6 py-4 border-t border-white/10 dark:border-gray-700/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-900/30 dark:to-emerald-900/30 backdrop-blur-sm">
                <button
                  onClick={() => window.location.href = `/api/tuning/download?id=${tuningFile.id}`}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Tuned File
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-md rounded-xl p-6 max-w-md w-full mx-4 border border-white/20 dark:border-gray-700/30"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                How was your experience?
              </h3>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleFeedback('positive')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400 transition-all duration-200"
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span>Good</span>
                </button>
                <button
                  onClick={() => handleFeedback('negative')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 transition-all duration-200"
                >
                  <ThumbsDown className="w-5 h-5" />
                  <span>Bad</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 