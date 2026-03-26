"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type PaymentGateway = 'paytm' | 'razorpay' | 'payu';

interface RazorpayHandlerResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayHandlerResponse) => Promise<void> | void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
    Paytm?: {
      CheckoutJS?: {
        init: (options: Record<string, unknown>) => Promise<void>;
        invoke: () => void;
      };
    };
  }
}

interface OrderData {
  gateway: 'payu' | 'razorpay' | 'paytm';
  action?: string;
  data?: Record<string, string>;
  key?: string;
  amount?: number;
  currency?: string;
  orderId?: string;
  mid?: string;
  txnToken?: string;
  env?: 'staging' | 'production';
}

export default function Premium() {
  const [loading, setLoading] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [autoRenew, setAutoRenew] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>('paytm');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => console.error('Failed to load Razorpay script');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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

    if (paymentGateway === 'razorpay' && !razorpayLoaded) {
      setError('Payment system initializing, please wait a moment.');
      return;
    }

    setLoading(planType);
    setError(null);

    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, amount, autoRenew, gateway: paymentGateway }),
      });

      if (!response.ok) {
        const body = await response.json();
        setError(body?.error ?? 'Failed to create payment order');
        setLoading(null);
        return;
      }

      const orderData = (await response.json()) as OrderData;

      if (orderData.gateway === 'payu' && orderData.action && orderData.data) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = orderData.action;

        Object.entries(orderData.data).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        return;
      }

      if (orderData.gateway === 'paytm' && orderData.mid && orderData.txnToken && orderData.orderId) {
        const paytmUrl = orderData.env === 'production'
          ? 'https://securegw.paytm.in/merchantpgpui/checkoutjs/merchants/'
          : 'https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/';

        const script = document.createElement('script');
        script.src = `${paytmUrl}${orderData.mid}.js`;
        script.onload = async () => {
          if (!window.Paytm?.CheckoutJS) {
            setError('Paytm checkout SDK not available');
            setLoading(null);
            return;
          }

          try {
            await window.Paytm.CheckoutJS.init({
              root: null,
              flow: 'DEFAULT',
              data: {
                orderId: orderData.orderId,
                token: orderData.txnToken,
                tokenType: 'TXN_TOKEN',
                amount: orderData.amount?.toString() ?? String(amount),
              },
              merchant: {
                mid: orderData.mid,
                redirect: false,
              },
            });

            window.Paytm.CheckoutJS.invoke();
          } catch (err) {
            console.error('Paytm checkout init failure', err);
            setError('Paytm checkout failed. Please try again.');
            setLoading(null);
          }
        };

        script.onerror = () => {
          setError('Failed to load Paytm checkout script');
          setLoading(null);
        };

        document.body.appendChild(script);
        return;
      }

      if (!orderData.key || !orderData.orderId || !orderData.currency || !orderData.amount) {
        setError('Invalid payment details received from server.');
        setLoading(null);
        return;
      }

      const options: RazorpayOptions = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'Vibely Premium',
        description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan Subscription`,
        handler: async (res: RazorpayHandlerResponse) => {
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: res.razorpay_order_id,
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_signature: res.razorpay_signature,
                planType,
                autoRenew,
              }),
            });

            if (verifyResponse.ok) {
              router.push('/payment/success');
            } else {
              router.push('/payment/failure');
            }
          } catch (err) {
            console.error('Razorpay verification failed', err);
            setError('Payment verification failed. Please try again.');
          }

          setLoading(null);
        },
        prefill: { name: '', email: '', contact: '' },
        theme: { color: '#000000' },
        modal: { ondismiss: () => setLoading(null) },
      };

      const RazorpayConstructor = window.Razorpay;
      if (!RazorpayConstructor) {
        setError('Razorpay checkout not available.');
        setLoading(null);
        return;
      }

      new RazorpayConstructor(options).open();
    } catch (err) {
      console.error('Payment error:', err);
      setError('Unable to start payment. Please try again.');
      setLoading(null);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-nude-beige flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-nude-beige flex items-center justify-center px-4">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
          >
            <h1 className="text-2xl font-bold mb-4">Login Required</h1>
            <p className="text-dark-grey mb-6">You need to be logged in to subscribe to premium features.</p>
            <button
              onClick={() => (window.location.href = '/login')}
              className="w-full bg-black text-nude-beige py-3 px-4 rounded-lg font-semibold"
            >
              Go to Login
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nude-beige p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Upgrade to Premium</h1>
          <p className="text-lg text-dark-grey">Unlock advanced filters and exclusive features</p>

          {/* Payment Methods Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mt-6 mb-6 max-w-2xl mx-auto"
          >
            <p className="text-sm font-semibold text-blue-900 mb-2">✅ PayTM Accepts All Payment Methods:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-blue-800">
              <div>💳 All Credit Cards</div>
              <div>💰 All Debit Cards</div>
              <div>📱 UPI (Google Pay, PhonePe, etc.)</div>
              <div>🏦 Net Banking</div>
              <div>👛 Digital Wallets</div>
              <div>🏢 BHIM Apps</div>
            </div>
          </motion.div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <label htmlFor="gateway" className="text-sm text-dark-grey font-semibold">Payment Gateway:</label>
            <select
              id="gateway"
              value={paymentGateway}
              onChange={(e) => setPaymentGateway(e.target.value as PaymentGateway)}
              className="p-3 border-2 border-black rounded bg-white font-semibold"
            >
              <option value="paytm">🎯 Paytm Business (Recommended) - All Payment Methods</option>
              <option value="razorpay">Razorpay (Alternative)</option>
              <option value="payu">PayU (Alternative)</option>
            </select>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <input
              id="autoRenew"
              type="checkbox"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              className="h-4 w-4 accent-black"
            />
            <label htmlFor="autoRenew" className="text-sm text-dark-grey">Auto-renew monthly subscription</label>
          </div>


          <p className="text-3xl font-bold mb-4">
            ₹110<span className="text-lg">/month</span>
          </p>

          <ul className="mb-6 space-y-2 text-left max-w-md mx-auto">
            <li>✓ Location-based matching</li>
            <li>✓ Priority in search results</li>
            <li>✓ Basic chat features</li>
          </ul>

          <motion.button
            whileHover={{ y: -2, boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}
            whileTap={{ y: 0 }}
            onClick={() => handlePayment('location', 110)}
            disabled={loading === 'location' || (paymentGateway === 'razorpay' && !razorpayLoaded)}
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
          <div className="bg-black text-nude-beige text-sm px-2 py-1 rounded mb-4 inline-block">Most Popular</div>
          <h2 className="text-2xl font-bold mb-4">Location + Gender</h2>
          <p className="text-3xl font-bold mb-4">₹220<span className="text-lg">/month</span></p>
          <ul className="mb-6 space-y-2 text-left">
            <li>✓ All Location features</li>
            <li>✓ Gender-based filtering</li>
            <li>✓ Advanced matching algorithm</li>
            <li>✓ Unlimited chats</li>
          </ul>
          <motion.button
            whileHover={{ y: -2, boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}
            whileTap={{ y: 0 }}
            onClick={() => handlePayment('premium', 220)}
            disabled={loading === 'premium' || (paymentGateway === 'razorpay' && !razorpayLoaded)}
            className="w-full bg-black text-nude-beige py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'premium' ? 'Processing...' : 'Subscribe'}
          </motion.button>
        </motion.div>

        {paymentGateway === 'razorpay' && !razorpayLoaded && (
          <div className="text-center mt-8">
            <p className="text-dark-grey">Loading Razorpay checkout...</p>
          </div>
        )}

        {error && (
          <div className="mt-8 text-center text-red-600 font-semibold">{error}</div>
        )}
      </div>
    </div>
  );
}
