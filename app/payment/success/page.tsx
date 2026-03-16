"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentSuccess() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch('/api/payment/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-nude-beige flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>Verifying your payment...</p>
        </div>
      </div>
    );
  }

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
          className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center"
        >
          <span className="text-2xl">✅</span>
        </motion.div>

        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>

        {status?.isPremium ? (
          <div className="mb-6">
            <p className="text-dark-grey mb-2">Welcome to Premium! 🎉</p>
            <div className="bg-nude-cream p-4 rounded-lg">
              <p className="font-semibold">{status.plan?.toUpperCase()} Plan</p>
              <p className="text-sm text-dark-grey">
                Valid until: {status.expiry ? new Date(status.expiry).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-dark-grey mb-2">Your premium status is being activated...</p>
            <p className="text-sm">Please refresh if you don't see your premium status.</p>
          </div>
        )}

        <div className="space-y-3">
          <motion.button
            whileHover={{ y: -2, boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}
            whileTap={{ y: 0 }}
            onClick={() => router.push('/lobby')}
            className="w-full bg-black text-nude-beige py-3 px-4 rounded-lg font-semibold"
          >
            Start Chatting
          </motion.button>

          <motion.button
            whileHover={{ y: -2, boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}
            whileTap={{ y: 0 }}
            onClick={() => router.push('/profile')}
            className="w-full bg-nude-cream text-black py-3 px-4 rounded-lg font-semibold border"
          >
            View Profile
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}