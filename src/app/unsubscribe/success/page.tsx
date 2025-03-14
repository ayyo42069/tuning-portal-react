'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, Home, ArrowLeft } from 'lucide-react';

export default function UnsubscribeSuccess() {
  // Log page view for analytics
  useEffect(() => {
    // You could add analytics tracking here if needed
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Successfully Unsubscribed
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              You have been successfully unsubscribed from all email communications.
            </p>
            <p className="mt-4 text-center text-sm text-gray-500">
              We're sorry to see you go. If you change your mind, you can update your email preferences in your account settings.
            </p>
            
            <div className="mt-8 flex justify-center space-x-4">
              <Link 
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Home className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Return to Home
              </Link>
              
              <Link
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeft className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}