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

    return NextResponse.json({
      callStatus: chat.callStatus || 'idle',
      callInitiatedBy: chat.callInitiatedBy || '',
      callAcceptedBy: chat.callAcceptedBy || '',
    });
  } catch (error) {
    console.error('Call status GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const roomId = (body.roomId || '').toString().trim();
    const action = (body.action || '').toString().trim(); // 'initiate', 'accept', 'decline'
    const userId = (body.userId || '').toString().trim();

    if (!roomId || !action || !userId) {
      return NextResponse.json({ error: 'roomId, action, and userId are required' }, { status: 400 });
    }

    const chat = await Chat.findOne({ roomId });
    if (!chat) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    if (action === 'initiate') {
      chat.callStatus = 'calling';
      chat.callInitiatedBy = userId;
      chat.callAcceptedBy = '';
    } else if (action === 'accept') {
      chat.callStatus = 'active';
      chat.callAcceptedBy = userId;
      chat.callStartedAt = new Date();
    } else if (action === 'decline') {
      chat.callStatus = 'declined';
      chat.callInitiatedBy = '';
      chat.callAcceptedBy = '';
    }

    await chat.save();
    return NextResponse.json({ success: true, callStatus: chat.callStatus });
  } catch (error) {
    console.error('Call status POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
