'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-nude-beige flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center"
      >
        <h1 className="text-3xl font-bold mb-4 text-black">Oops!</h1>
        <p className="text-dark-grey mb-6">
          Something went wrong. Please try again.
        </p>
        <p className="text-sm text-red-500 mb-6 font-mono break-words">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="bg-black text-nude-beige px-6 py-2 rounded font-bold hover:bg-dark-grey transition"
        >
          Try Again
        </button>
      </motion.div>
    </div>
  );
}
