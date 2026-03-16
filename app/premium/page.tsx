"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Premium() {
  const [loading, setLoading] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [autoRenew, setAutoRenew] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => console.error('Failed to load Razorpay script');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async (planType: string, amount: number) => {
    if (!razorpayLoaded) {
      alert('Payment system is loading. Please try again.');
      return;
    }

    setLoading(planType);

    try {
      // Create order
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType, amount, autoRenew }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment order');
      }

      const orderData = await response.json();

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'Vibely Premium',
        description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan Subscription`,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planType: planType,
                autoRenew: autoRenew,
              }),
            });

            if (verifyResponse.ok) {
              router.push('/payment/success');
            } else {
              router.push('/payment/failure');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            router.push('/payment/failure');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: function() {
            setLoading(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      router.push('/payment/failure');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-nude-beige p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Upgrade to Premium</h1>
          <p className="text-lg text-dark-grey">Unlock advanced filters and exclusive features</p>

        <div className="mt-6 flex items-center justify-center gap-2">
          <input
            id="autoRenew"
            type="checkbox"
            checked={autoRenew}
            onChange={(e) => setAutoRenew(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="autoRenew" className="text-sm text-dark-grey">
            Auto-renew monthly subscription
          </label>
        </div>
      </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-4">Location Filter</h2>
            <p className="text-3xl font-bold mb-4">₹110<span className="text-lg">/month</span></p>
            <ul className="mb-6 space-y-2">
              <li>✓ Location-based matching</li>
              <li>✓ Priority in search results</li>
              <li>✓ Basic chat features</li>
            </ul>
            <motion.button
              whileHover={{ y: -2, boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}
              whileTap={{ y: 0 }}
              onClick={() => handlePayment('location', 110)}
              disabled={loading === 'location' || !razorpayLoaded}
              className="w-full bg-black text-nude-beige py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'location' ? 'Processing...' : 'Subscribe'}
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-lg border-2 border-black"
          >
            <div className="bg-black text-nude-beige text-sm px-2 py-1 rounded mb-4 inline-block">
              Most Popular
            </div>
            <h2 className="text-2xl font-bold mb-4">Location + Gender</h2>
            <p className="text-3xl font-bold mb-4">₹220<span className="text-lg">/month</span></p>
            <ul className="mb-6 space-y-2">
              <li>✓ All Location features</li>
              <li>✓ Gender-based filtering</li>
              <li>✓ Advanced matching algorithm</li>
              <li>✓ Unlimited chats</li>
            </ul>
            <motion.button
              whileHover={{ y: -2, boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}
              whileTap={{ y: 0 }}
              onClick={() => handlePayment('premium', 220)}
              disabled={loading === 'premium' || !razorpayLoaded}
              className="w-full bg-black text-nude-beige py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'premium' ? 'Processing...' : 'Subscribe'}
            </motion.button>
          </motion.div>
        </div>

        {!razorpayLoaded && (
          <div className="text-center mt-8">
            <p className="text-dark-grey">Loading payment system...</p>
          </div>
        )}
      </div>
    </div>
  );
}