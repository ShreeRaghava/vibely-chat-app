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

    const chat = await Chat.findOne({ roomId });
    if (!chat) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    return NextResponse.json({ peerIds: chat.peerIds || [] });
  } catch (error) {
    console.error('Chat peer GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const roomId = (body.roomId || '').toString().trim();
    const senderId = (body.senderId || '').toString().trim();
    const peerId = (body.peerId || '').toString().trim();

    if (!roomId || !senderId || !peerId) {
      return NextResponse.json({ error: 'roomId, senderId, and peerId are required' }, { status: 400 });
    }

    const chat = await Chat.findOne({ roomId });
    if (!chat) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    const existingIndex = (chat.peerIds || []).findIndex((entry: any) => entry.senderId === senderId);
    if (existingIndex >= 0) {
      chat.peerIds[existingIndex].peerId = peerId;
    } else {
      chat.peerIds = [...(chat.peerIds || []), { senderId, peerId }];
    }

    await chat.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chat peer POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
