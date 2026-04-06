'use client';

import { motion } from 'framer-motion';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-4 border-nude-cream border-t-black rounded-full"
      />
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-nude-beige flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <LoadingSpinner />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-dark-grey mt-4 font-mono"
        >
          Loading...
        </motion.p>
      </motion.div>
    </div>
  );
}

export function LoadingSkeleton({ width = 'w-full', height = 'h-10' }: { width?: string; height?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={`${width} ${height} bg-nude-cream rounded`}
    />
  );
}
