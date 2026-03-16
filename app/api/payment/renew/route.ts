import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const planPricing: Record<string, number> = {
  location: 110,
  premium: 220,
};

export async function POST(request: NextRequest) {
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

    const planType = user.premiumPlan || 'premium';
    const amount = planPricing[planType] || 220;

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: session.user.id,
        planType,
        autoRenew: 'true',
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      planType,
      autoRenew: true,
    });
  } catch (error) {
    console.error('Renewal creation error:', error);
    return NextResponse.json({ error: 'Failed to create renewal order' }, { status: 500 });
  }
}
