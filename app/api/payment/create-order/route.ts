import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('Razorpay Create Order API called');
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planType, amount, autoRenew } = await request.json();
    console.log('Request data:', { planType, amount, autoRenew });

    if (!planType || !amount) {
      return NextResponse.json({ error: 'Plan type and amount are required' }, { status: 400 });
    }

    // Razorpay Configuration
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not configured');
      return NextResponse.json({
        error: 'Payment gateway not configured. Please contact support.'
      }, { status: 500 });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    // Generate unique Order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Create Razorpay order
    const orderOptions = {
      amount: amount * 100, // Razorpay expects amount in paisa
      currency: 'INR',
      receipt: orderId,
      payment_capture: 1,
    };

    console.log('Creating Razorpay order:', orderOptions);

    const order = await razorpay.orders.create(orderOptions);
    console.log('Razorpay order created:', order.id);

    return NextResponse.json({
      gateway: 'razorpay',
      orderId: order.id,
      amount: amount.toString(),
      currency: 'INR',
      key: razorpayKeyId,
      planType,
      autoRenew: autoRenew || false,
      upiApps: ['paytm', 'phonepe', 'googlepay'], // Specific UPI apps enabled
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: `Failed to create payment: ${errorMessage}`
    }, { status: 500 });
  }
}