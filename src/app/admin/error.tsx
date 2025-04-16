'use client';

import { useEffect } from 'react';
import ServerError from '@/components/ServerError';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to admin error monitoring service
    console.error('Admin section error:', error);
  }, [error]);

  // Override the error message for admin section
  const adminError = new Error("An error occurred in the admin section. This has been reported to the system administrators.");

  return (
    <ServerError 
      error={adminError} 
      reset={reset} 
    />
  );
} 