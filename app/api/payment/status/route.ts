import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select('isPremium premiumPlan premiumExpiry autoRenew');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if premium is still active
    const isActive = user.isPremium && user.premiumExpiry && user.premiumExpiry > new Date();
    const isExpired = user.isPremium && user.premiumExpiry && user.premiumExpiry <= new Date();

    return NextResponse.json({
      isPremium: isActive,
      isExpired,
      plan: user.premiumPlan,
      expiry: user.premiumExpiry,
      autoRenew: user.autoRenew || false,
    });
  } catch (error) {
    console.error('Premium status check error:', error);
    return NextResponse.json({ error: 'Failed to check premium status' }, { status: 500 });
  }
}