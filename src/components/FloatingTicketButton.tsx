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
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        aria-label="Open Support Tickets"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 md:p-6">
          {/* Modal Content */}
          <div
            ref={modalRef}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-10"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Support Tickets
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
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
