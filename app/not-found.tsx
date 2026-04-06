'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-nude-beige flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center"
      >
        <h1 className="text-5xl font-bold mb-4 text-black">404</h1>
        <h2 className="text-2xl font-bold mb-2 text-black">Page Not Found</h2>
        <p className="text-dark-grey mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-black text-nude-beige px-6 py-2 rounded font-bold hover:bg-dark-grey transition"
        >
          Go Home
        </Link>
      </motion.div>
    </div>
  );
}
