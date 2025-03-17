"use client";

import { useState } from "react";
import { Clock } from "lucide-react";

interface EstimatedTimeSelectorProps {
  initialValue?: string;
  onTimeSelected: (time: string) => void;
}

export default function EstimatedTimeSelector({
  initialValue = "",
  onTimeSelected,
}: EstimatedTimeSelectorProps) {
  const [customTime, setCustomTime] = useState<string>(initialValue);
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  const predefinedTimes = [
    "1 hour",
    "2 hours",
    "4 hours",
    "8 hours",
    "24 hours",
    "2-3 days",
  ];

  const handlePredefinedTimeClick = (time: string) => {
    onTimeSelected(time);
    setCustomTime("");
    setShowCustomInput(false);
  };

  const handleCustomTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTime.trim()) {
      onTimeSelected(customTime);
      setShowCustomInput(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-wrap gap-2">
        {predefinedTimes.map((time) => (
          <button
            key={time}
            type="button"
            onClick={() => handlePredefinedTimeClick(time)}
            className={`px-3 py-1.5 text-sm border rounded-md flex items-center gap-1.5 hover:bg-gray-100 ${
              initialValue === time
                ? "bg-gray-100 border-gray-400"
                : "border-gray-300"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {time}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowCustomInput(true)}
          className={`px-3 py-1.5 text-sm border rounded-md flex items-center gap-1.5 hover:bg-gray-100 ${
            showCustomInput ? "bg-gray-100 border-gray-400" : "border-gray-300"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Custom
        </button>
      </div>

      {showCustomInput && (
        <form
          onSubmit={handleCustomTimeSubmit}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            placeholder="e.g. 3-5 days"
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md flex-1"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Set
          </button>
          <button
            type="button"
            onClick={() => setShowCustomInput(false)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
