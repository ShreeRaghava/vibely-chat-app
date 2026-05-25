import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chat from '@/lib/models/Chat';
import MatchQueue from '@/lib/models/MatchQueue';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const roomId = request.nextUrl.searchParams.get('roomId');
    if (!roomId) {
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
    }

    // Check if chat exists (match happened)
    const chat = await Chat.findOne({ roomId });
    if (chat) {
      console.log(`[MATCH-STATUS] ✓ Match found for room ${roomId}`);
      return NextResponse.json({ matched: true, roomId });
    }

    // Check if still in queue (waiting)
    const queueEntry = await MatchQueue.findOne({ roomId });
    if (queueEntry) {
      console.log(`[MATCH-STATUS] ⏳ Still waiting for match on room ${roomId}`);
      return NextResponse.json({ matched: false, roomId });
    }

    console.log(`[MATCH-STATUS] ❌ Room not found: ${roomId}`);
    return NextResponse.json({ matched: false, notFound: true });
  } catch (error) {
    console.error('Match status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
