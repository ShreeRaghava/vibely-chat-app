import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chat from '@/lib/models/Chat';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const roomId = request.nextUrl.searchParams.get('roomId');
    if (!roomId) {
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
    }

    let chat = await Chat.findOne({ roomId });
    
    // If chat doesn't exist yet, create it
    if (!chat) {
      console.log('Chat room not found, creating new one:', roomId);
      chat = await Chat.create({
        roomId,
        participants: [],
        messages: [],
        peerIds: [],
      });
    }

    return NextResponse.json({
      messages: chat.messages || [],
      peerIds: chat.peerIds || [],
      participants: chat.participants || [],
    });
  } catch (error) {
    console.error('Chat history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
