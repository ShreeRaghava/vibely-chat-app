"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface OrderData {
  gateway: 'razorpay';
  orderId: string;
  amount: string;
  currency: string;
  key: string;
  planType: string;
  autoRenew: boolean;
  upiApps: string[];
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes: {
    address?: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
  upi_apps?: string[];
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export default function Premium() {
  const [loading, setLoading] = useState<string | null>(null);
  const [autoRenew, setAutoRenew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?message=Please login to subscribe to premium');
    }
  }, [status, router]);

  const handlePayment = async (planType: string, amount: number) => {
    if (status !== 'authenticated') {
      window.location.href = '/login?message=Please login to subscribe to premium';
      return;
    }

    setLoading(planType);
    setError(null);

    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, amount, autoRenew }),
      });

      if (!response.ok) {
        const body = await response.json();
        setError(body?.error ?? 'Failed to create payment order');
        setLoading(null);
        return;
      }

      const orderData = (await response.json()) as OrderData;

      if (orderData.gateway === 'razorpay' && orderData.key && orderData.orderId) {
        // Load Razorpay script if not already loaded
        if (!window.Razorpay) {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => initializeRazorpay(orderData);
          script.onerror = () => {
            setError('Failed to load Razorpay checkout');
            setLoading(null);
          };
          document.body.appendChild(script);
        } else {
          initializeRazorpay(orderData);
        }
      } else {
        setError('Unexpected response format from payment gateway');
        setLoading(null);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Unable to start payment. Please try again.');
      setLoading(null);
    }
  };

  const initializeRazorpay = (orderData: OrderData) => {
    if (!window.Razorpay) {
      setError('Razorpay not available');
      setLoading(null);
      return;
    }

    const options: RazorpayOptions = {
      key: orderData.key,
      amount: parseInt(orderData.amount) * 100, // Convert to paisa
      currency: orderData.currency,
      name: 'Vibely',
      description: `${orderData.planType} Subscription`,
      order_id: orderData.orderId,
      handler: async (response: RazorpayResponse) => {
        try {
          // Verify payment
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyResponse.ok) {
            router.push('/profile?message=Payment successful! Your premium subscription is now active.');
          } else {
            setError('Payment verification failed. Please contact support.');
          }
        } catch (err) {
          console.error('Verification error:', err);
          setError('Payment verification failed. Please contact support.');
        }
        setLoading(null);
      },
      prefill: {
        name: session?.user?.name || '',
        email: session?.user?.email || '',
      },
      notes: {
        address: 'Vibely Premium Subscription',
      },
      theme: {
        color: '#000000',
      },
      modal: {
        ondismiss: () => {
          setLoading(null);
        },
      },
      upi_apps: orderData.upiApps, // Enable specific UPI apps: paytm, phonepe, googlepay
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
          >
            <h1 className="text-2xl font-bold mb-4">Login Required</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to subscribe to premium features.</p>
            <button
              onClick={() => (window.location.href = '/login')}
              className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold"
            >
              Go to Login
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Upgrade to Premium</h1>
          <p className="text-lg text-gray-600">Unlock advanced filters and exclusive features</p>

          {/* Payment Methods Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mt-6 mb-6 max-w-2xl mx-auto"
          >
            <p className="text-sm font-semibold text-blue-900 mb-2">✅ Razorpay Accepts All Payment Methods:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-blue-800">
              <div>💳 Credit Cards</div>
              <div>💰 Debit Cards</div>
              <div>📱 UPI (Paytm, PhonePe, Google Pay)</div>
              <div>🏦 Net Banking</div>
              <div>👛 Digital Wallets</div>
              <div>💸 EMI Options</div>
            </div>
          </motion.div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <input
              id="autoRenew"
              type="checkbox"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              className="h-4 w-4 accent-black"
            />
            <label htmlFor="autoRenew" className="text-sm text-gray-600">Auto-renew monthly subscription</label>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Location Filter Plan */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-300"
          >
            <h2 className="text-2xl font-bold mb-4">Location Filter</h2>
            <p className="text-3xl font-bold mb-4">
              ₹110<span className="text-lg">/month</span>
            </p>

            <ul className="mb-6 space-y-2 text-left">
              <li>✓ Filter by location</li>
              <li>✓ Priority in search results</li>
              <li>✓ 30 day access</li>
              <li>✓ All payment methods</li>
            </ul>

            <motion.button
              whileHover={{ y: -2, boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}
              whileTap={{ y: 0 }}
              onClick={() => handlePayment('location', 110)}
              disabled={loading === 'location'}
              className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'location' ? 'Processing...' : 'Subscribe Now'}
            </motion.button>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-lg border-2 border-black"
          >
            <div className="bg-black text-white text-sm px-2 py-1 rounded mb-4 inline-block">Most Popular</div>
            <h2 className="text-2xl font-bold mb-4">Location + Gender</h2>
            <p className="text-3xl font-bold mb-4">
              ₹220<span className="text-lg">/month</span>
            </p>
            <ul className="mb-6 space-y-2 text-left">
              <li>✓ Filter by location & gender</li>
              <li>✓ Advanced matching</li>
              <li>✓ No ads</li>
              <li>✓ Priority support</li>
              <li>✓ All payment methods</li>
            </ul>

            <motion.button
              whileHover={{ y: -2, boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}
              whileTap={{ y: 0 }}
              onClick={() => handlePayment('premium', 220)}
              disabled={loading === 'premium'}
              className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'premium' ? 'Processing...' : 'Subscribe Now'}
            </motion.button>
          </motion.div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-red-100 border-2 border-red-500 rounded-lg text-red-700 font-semibold text-center"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center text-sm text-gray-500"
        >
          <p>Secured by <strong>Razorpay</strong> • All transactions are encrypted • 100% secure payments</p>
        </motion.div>
      </div>
    </div>
  );
}
