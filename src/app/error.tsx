'use client';

import { useEffect } from 'react';
import ServerError from '@/components/ServerError';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled error:', error);
  }, [error]);

  return <ServerError error={error} reset={reset} />;
} 