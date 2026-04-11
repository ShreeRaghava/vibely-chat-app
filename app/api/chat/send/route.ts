import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chat from '@/lib/models/Chat';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const roomId = (body.roomId || '').toString().trim();
    const senderId = (body.senderId || '').toString().trim();
    const content = (body.content || '').toString().trim();

    if (!roomId || !senderId || !content) {
      return NextResponse.json({ error: 'roomId, senderId, and content are required' }, { status: 400 });
    }

    const chat = await Chat.findOne({ roomId });
    if (!chat) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    chat.messages.push({
      sender: senderId,
      content,
      timestamp: new Date(),
    });

    await chat.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chat send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
