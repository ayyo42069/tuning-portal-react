"use client";

import { useState, useEffect } from "react";

interface CookieConsentProps {
  onAccept?: () => void;
}

export const CookieConsent = ({ onAccept }: CookieConsentProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem("cookiesAccepted");
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setIsVisible(false);
    if (onAccept) {
      onAccept();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0 text-gray-700 dark:text-gray-300">
          <p>
            We use cookies to enhance your experience on our website. By
            continuing to browse, you agree to our{" "}
            <a
              href="/privacy"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-300"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
