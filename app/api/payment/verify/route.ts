import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType, autoRenew } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planType) {
      return NextResponse.json({ error: 'Missing payment verification data' }, { status: 400 });
    }

    // Verify payment signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Update user premium status
    await connectDB();

    const premiumExpiry = new Date();
    premiumExpiry.setMonth(premiumExpiry.getMonth() + 1); // 1 month subscription

    await User.findByIdAndUpdate(session.user.id, {
      isPremium: true,
      premiumExpiry: premiumExpiry,
      premiumPlan: planType,
      autoRenew: !!autoRenew,
      razorpayPaymentId: razorpay_payment_id,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and premium activated',
      premiumExpiry: premiumExpiry,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}