import React, { useState } from "react";
import { Ticket } from "./types";

type NewTicketFormProps = {
  onSubmit: (
    subject: string,
    description: string,
    priority: Ticket["priority"]
  ) => void;
  onCancel: () => void;
};

const NewTicketForm: React.FC<NewTicketFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Ticket["priority"]>("medium");
  const [errors, setErrors] = useState<{
    subject?: string;
    description?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: { subject?: string; description?: string } = {};
    if (!subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit the form
    onSubmit(subject, description, priority);
  };

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-5 rounded-xl shadow-md border border-gray-200/50 dark:border-gray-700/50">
      <h4 className="font-medium text-base text-gray-900 dark:text-white mb-4 flex items-center">
        <span className="inline-block w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded mr-2"></span>
        Create New Support Ticket
      </h4>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Subject Field */}
        <div>
          <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
            Subject *
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject) {
                setErrors({ ...errors, subject: undefined });
              }
            }}
            placeholder="Brief summary of your issue"
            className={`w-full p-2.5 text-sm border ${
              errors.subject
                ? "border-red-500 dark:border-red-700 ring-1 ring-red-500/30 dark:ring-red-700/30"
                : "border-gray-300/70 dark:border-gray-600/70 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
            } rounded-lg bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200 shadow-sm`}
          />
          {errors.subject && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">
              {errors.subject}
            </p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) {
                setErrors({ ...errors, description: undefined });
              }
            }}
            placeholder="Detailed explanation of your issue"
            className={`w-full p-2.5 text-sm border ${
              errors.description
                ? "border-red-500 dark:border-red-700 ring-1 ring-red-500/30 dark:ring-red-700/30"
                : "border-gray-300/70 dark:border-gray-600/70 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
            } rounded-lg bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white min-h-[150px] transition-all duration-200 shadow-sm`}
          />
          {errors.description && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">
              {errors.description}
            </p>
          )}
        </div>

        {/* Priority Field */}
        <div>
          <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Ticket["priority"])}
            className="w-full p-2.5 text-sm border border-gray-300/70 dark:border-gray-600/70 rounded-lg bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200 shadow-sm focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-gray-300/70 dark:border-gray-600/70 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-sm backdrop-blur-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 hover:shadow-md"
          >
            Submit Ticket
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTicketForm;
