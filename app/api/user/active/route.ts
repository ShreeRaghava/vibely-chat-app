import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Update lastActive timestamp
    await User.findByIdAndUpdate(session.user.id, { lastActive: new Date() });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update active error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}