import { NextResponse } from 'next/server';

/**
 * @deprecated This endpoint is for PayU which is no longer supported.
 * Payment verification is now handled only through Paytm Business.
 * See /api/payment/paytm-verify for Paytm payment verification.
 */
export async function POST() {
  return NextResponse.json({ 
    error: 'This endpoint is deprecated. PayU is no longer supported. Paytm Business is the only supported payment gateway.' 
  }, { status: 410 });
}
