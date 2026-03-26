import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      mihpayid,
      status,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      hash,
      planType,
      autoRenew,
    } = body;

    const payuKey = process.env.PAYU_MERCHANT_KEY;
    const payuSalt = process.env.PAYU_MERCHANT_SALT;

    if (!payuKey || !payuSalt) {
      return NextResponse.json({ error: 'PayU keys not configured' }, { status: 400 });
    }

    if (!hash || !status || !txnid) {
      return NextResponse.json({ error: 'Invalid PayU callback parameters' }, { status: 400 });
    }

    const expectedHash = crypto
      .createHash('sha512')
      .update(`${payuSalt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${payuKey}`)
      .digest('hex');

    if (hash !== expectedHash) {
      return NextResponse.json({ error: 'Invalid PayU hash' }, { status: 400 });
    }

    if (status !== 'success') {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);

    await User.findByIdAndUpdate(session.user.id, {
      isPremium: true,
      premiumExpiry: expiry,
      premiumPlan: planType || 'premium',
      autoRenew: !!autoRenew,
      razorpayPaymentId: mihpayid,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PayU verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
