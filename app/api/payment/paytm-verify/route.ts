import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    const paytmKey = process.env.PAYTM_MERCHANT_KEY;

    if (!paytmKey) {
      return NextResponse.json({ error: 'Paytm key not configured' }, { status: 500 });
    }

    const receivedChecksum = payload.CHECKSUMHASH || payload.signature || '';
    const verifyObject = { ...payload };
    delete verifyObject.CHECKSUMHASH;
    delete verifyObject.signature;

    const data = Object.keys(verifyObject)
      .sort()
      .map((k) => verifyObject[k])
      .join('|');

    const generatedChecksum = crypto
      .createHmac('sha256', paytmKey)
      .update(data)
      .digest('base64');

    if (!receivedChecksum || generatedChecksum !== receivedChecksum) {
      return NextResponse.json({ error: 'Paytm checksum mismatch' }, { status: 400 });
    }

    if (payload.STATUS !== 'TXN_SUCCESS') {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
    }

    await connectDB();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);

    await User.findByIdAndUpdate(session.user.id, {
      isPremium: true,
      premiumExpiry: expiry,
      premiumPlan: payload.UDF1 || 'premium',
      autoRenew: payload.UDF2 === 'true',
      paytmTransactionId: payload.TXNID,
    });

    return NextResponse.json({ success: true, isPremium: true, expiry });
  } catch (error) {
    console.error('Paytm verify error:', error);
    return NextResponse.json({ error: 'Paytm verify failed' }, { status: 500 });
  }
}
