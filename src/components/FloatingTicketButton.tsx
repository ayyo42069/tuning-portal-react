"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import TicketSystem from "./tickets/TicketSystem";
import { User } from "./tickets/types";

const FloatingTicketButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const { user, isLoading, error } = useAuth();

  // Close the modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        aria-label="Open Support Tickets"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6">
          {/* Modal Content */}
          <div
            ref={modalRef}
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-10 border border-gray-200/50 dark:border-gray-700/50"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800">
              <h3 className="text-lg font-medium text-white">
                Support Tickets
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white focus:outline-none transition-colors duration-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md text-red-800 dark:text-red-200">
                  {error}
                </div>
              ) : !user ? (
                <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-md text-yellow-800 dark:text-yellow-200">
                  Please log in to access the ticket system.
                </div>
              ) : (
                <div className="h-[600px]">
                  <TicketSystem currentUser={user} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingTicketButton;
