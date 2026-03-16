"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function PaymentFailure() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-nude-beige flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center"
        >
          <span className="text-2xl">❌</span>
        </motion.div>

        <h1 className="text-2xl font-bold mb-4">Payment Failed</h1>

        <p className="text-dark-grey mb-6">
          We couldn't process your payment. This might be due to insufficient funds,
          card issues, or network problems. Please try again.
        </p>

        <div className="space-y-3">
          <motion.button
            whileHover={{ y: -2, boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}
            whileTap={{ y: 0 }}
            onClick={() => router.push('/premium')}
            className="w-full bg-black text-nude-beige py-3 px-4 rounded-lg font-semibold"
          >
            Try Again
          </motion.button>

          <motion.button
            whileHover={{ y: -2, boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}
            whileTap={{ y: 0 }}
            onClick={() => router.push('/lobby')}
            className="w-full bg-nude-cream text-black py-3 px-4 rounded-lg font-semibold border"
          >
            Back to Lobby
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}