import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    console.log('Create order API called');
    const session = await auth();
    console.log('Session:', session);
    if (!session?.user?.id) {
      console.log('No session user id');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planType, amount, autoRenew } = await request.json();
    console.log('Request data:', { planType, amount, autoRenew });

    if (!planType || !amount) {
      return NextResponse.json({ error: 'Plan type and amount are required' }, { status: 400 });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paisa
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: session.user.id,
        planType,
        autoRenew: autoRenew ? 'true' : 'false',
      },
    };

    console.log('Creating Razorpay order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Order created:', order);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: `Failed to create payment: ${error.message}` }, { status: 500 });
  }
}