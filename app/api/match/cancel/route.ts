import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MatchQueue from '@/lib/models/MatchQueue';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { roomId } = await request.json();
    if (!roomId) {
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
    }

    const result = await MatchQueue.deleteOne({ roomId });
    console.log(`[MATCH-CANCEL] Cancelled room: ${roomId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Match cancel error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
