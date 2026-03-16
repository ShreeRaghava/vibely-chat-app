import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chat from '@/lib/models/Chat';
import MatchRequest from '@/lib/models/MatchRequest';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const roomId = request.nextUrl.searchParams.get('roomId');
    if (!roomId) {
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
    }

    const chat = await Chat.findOne({ roomId });
    if (chat) {
      return NextResponse.json({ matched: true, roomId });
    }

    const requestEntry = await MatchRequest.findOne({ roomId });
    if (requestEntry) {
      return NextResponse.json({ matched: false, roomId });
    }

    return NextResponse.json({ matched: false, notFound: true });
  } catch (error) {
    console.error('Match status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
