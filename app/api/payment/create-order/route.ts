import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { auth } from '@/lib/auth';

function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys not configured');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

function getPayuHash(payload: { key: string; txnid: string; amount: string; productinfo: string; firstname: string; email: string; salt: string }) {
  const hashString = `${payload.key}|${payload.txnid}|${payload.amount}|${payload.productinfo}|${payload.firstname}|${payload.email}|||||||||||${payload.salt}`;
  return crypto.createHash('sha512').update(hashString).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    console.log('Create order API called');
    const session = await auth();
    console.log('Session:', session);
    if (!session?.user?.id) {
      console.log('No session user id');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planType, amount, autoRenew, gateway } = await request.json();
    console.log('Request data:', { planType, amount, autoRenew, gateway });

    if (!planType || !amount) {
      return NextResponse.json({ error: 'Plan type and amount are required' }, { status: 400 });
    }

    const payuKey = process.env.PAYU_MERCHANT_KEY;
    const payuSalt = process.env.PAYU_MERCHANT_SALT;
    const isPayuAvailable = !!payuKey && !!payuSalt;

    const paytmMid = process.env.PAYTM_MID;
    const paytmKey = process.env.PAYTM_MERCHANT_KEY;
    const paytmWebsite = process.env.PAYTM_WEBSITE || 'WEBSTAGING';
    const paytmChannel = process.env.PAYTM_CHANNEL_ID || 'WEB';
    const paytmBaseUrl = process.env.PAYTM_ENV === 'production' ? 'https://securegw.paytm.in' : 'https://securegw-stage.paytm.in';
    const isPaytmAvailable = !!paytmMid && !!paytmKey;

    const usePaytm = gateway === 'paytm' && isPaytmAvailable;
    const usePayu = !usePaytm && isPayuAvailable;

    if (usePaytm) {
      // Build order for PayTM
      const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const amountString = amount.toString();

      const callbackUrl = `${process.env.NEXTAUTH_URL}/payment/success?gateway=paytm`;
      const paytmBody = {
        requestType: 'Payment',
        mid: paytmMid,
        websiteName: paytmWebsite,
        orderId,
        callbackUrl,
        txnAmount: {
          value: amountString,
          currency: 'INR',
        },
        userInfo: {
          custId: (session.user?.id || 'guest').toString(),
        },
        // Enable all payment modes in PayTM Business
        paymentMode: {
          upi: true,
          cards: true,
          netbanking: true,
          wallet: true,
          emi: true,
          prepaid: true,
        },
        enablePaymentMode: {
          UPI: true,
          CARDS: true,
          NETBANKING: true,
          WALLET: true,
          EMI: true,
          PREPAID: true,
        },
      };

      const checksum = crypto
        .createHmac('sha256', paytmKey)
        .update(JSON.stringify(paytmBody))
        .digest('base64');

      const initUrl = `${paytmBaseUrl}/theia/api/v1/initiateTransaction?mid=${paytmMid}&orderId=${orderId}`;

      const initRes = await fetch(initUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: paytmBody, head: { signature: checksum } }),
      });

      const initData = await initRes.json();
      if (!initData.body || !initData.body.txnToken) {
        throw new Error(`Paytm initiation failed: ${JSON.stringify(initData)}`);
      }

      return NextResponse.json({
        gateway: 'paytm',
        mid: paytmMid,
        orderId,
        amount: amountString,
        txnToken: initData.body.txnToken,
        channel: paytmChannel,
        callbackUrl,
        env: process.env.PAYTM_ENV || 'staging',
      });
    }

    if (usePayu) {
      // PayU order payload
      const txnid = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const firstname = session.user?.name || 'Anonymous';
      const email = session.user?.email || 'guest@example.com';
      const amountString = amount.toString();
      const productInfo = `${planType} plan`;

      const payuHash = getPayuHash({
        key: payuKey,
        txnid,
        amount: amountString,
        productinfo: productInfo,
        firstname,
        email,
        salt: payuSalt,
      });

      return NextResponse.json({
        gateway: 'payu',
        action: process.env.NODE_ENV === 'production' ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment',
        data: {
          key: payuKey,
          txnid,
          amount: amountString,
          productinfo: productInfo,
          firstname,
          email,
          phone: session.user?.phone || '',
          surl: `${process.env.NEXTAUTH_URL}/payment/success`,
          furl: `${process.env.NEXTAUTH_URL}/payment/failure`,
          service_provider: 'payu_paisa',
          hash: payuHash,
        },
      });
    }

    // Fallback to Razorpay order
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
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);
    console.log('Order created:', order);

    return NextResponse.json({
      gateway: 'razorpay',
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to create payment: ${errorMessage}` }, { status: 500 });
  }
}