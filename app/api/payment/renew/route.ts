import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

const planPricing: Record<string, number> = {
  location: 110,
  premium: 220,
};

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.autoRenew) {
      return NextResponse.json({ error: 'Auto-renew not enabled' }, { status: 400 });
    }

    // Razorpay Configuration
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const planType = user.premiumPlan || 'premium';
    const amount = planPricing[planType] || 220;
    const orderId = `renew_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Create Razorpay order for renewal
    const orderOptions = {
      amount: amount * 100, // Razorpay expects amount in paisa
      currency: 'INR',
      receipt: orderId,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json({
      gateway: 'razorpay',
      orderId: order.id,
      amount: amount.toString(),
      currency: 'INR',
      key: razorpayKeyId,
      planType,
      autoRenew: true,
      upiApps: ['paytm', 'phonepe', 'googlepay'], // Specific UPI apps enabled
    });
  } catch (error) {
    console.error('Renewal creation error:', error);
    return NextResponse.json({ error: 'Failed to create renewal order' }, { status: 500 });
  }
}
