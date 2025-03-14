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
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-3">
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
            className={`w-full p-2 text-xs border ${
              errors.subject
                ? "border-red-500 dark:border-red-700"
                : "border-gray-300 dark:border-gray-600"
            } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
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
            className={`w-full p-2 text-xs border ${
              errors.description
                ? "border-red-500 dark:border-red-700"
                : "border-gray-300 dark:border-gray-600"
            } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[120px]`}
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
            className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
          >
            Create Ticket
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTicketForm;
