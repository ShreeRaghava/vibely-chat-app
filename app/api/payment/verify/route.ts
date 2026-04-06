import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Verify Razorpay signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Extract user ID from order ID (assuming format: order_timestamp_random)
    const orderParts = razorpay_order_id.split('_');
    if (orderParts.length < 3) {
      return NextResponse.json({ error: 'Invalid order format' }, { status: 400 });
    }

    // For renewal orders, we need to find the user differently
    // This is a simplified version - in production you'd store order-user mapping
    const isRenewal = razorpay_order_id.startsWith('renew_');

    if (isRenewal) {
      // For renewals, we'd need additional logic to identify the user
      // This is a placeholder - you'd need to implement proper user identification
      return NextResponse.json({ error: 'Renewal verification not implemented' }, { status: 501 });
    }

    // For new subscriptions, we'd need to get user from session or stored mapping
    // This is simplified - in production implement proper order tracking
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}