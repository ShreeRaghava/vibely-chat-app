import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chat from '@/lib/models/Chat';
import MatchQueue from '@/lib/models/MatchQueue';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    await dbConnect();

    let session = null;
    try {
      session = await auth();
    } catch (error) {
      session = null;
    }

    const body = await request.json();
    const chatType = (body.chatType || 'text').toString().trim().toLowerCase();
    const guestId = (body.guestId || '').toString().trim();

    const currentUserId = session?.user?.id || '';
    const hasUser = Boolean(currentUserId);
    const hasGuest = Boolean(guestId);

    if (!hasUser && !hasGuest) {
      return NextResponse.json({ error: 'Guest ID or login required' }, { status: 400 });
    }

    const userId = currentUserId || guestId;
    const userType = hasUser ? 'user' : 'guest';
    const queueKey = chatType; // Simple queue key - just the chat type

    console.log(`\n[MATCH-QUEUE] ========== NEW MATCH REQUEST ==========`);
    console.log(`[MATCH-QUEUE] Queue Key: ${queueKey}`);
    console.log(`[MATCH-QUEUE] User: ${userId} (${userType})`);

    // STEP 1: Check if THIS user already in queue
    const existingEntry = await MatchQueue.findOne({ queueKey, userId });
    if (existingEntry) {
      console.log(`[MATCH-QUEUE] ✓ User already in queue | Room: ${existingEntry.roomId}`);
      return NextResponse.json({ roomId: existingEntry.roomId, guestId });
    }

    // STEP 2: Look for FIRST waiting person in queue
    console.log(`[MATCH-QUEUE] Step 1: Looking for first person in queue...`);
    const firstWaiting = await MatchQueue.findOne({ queueKey });

    if (firstWaiting) {
      // FOUND SOMEONE! Use THEIR room
      console.log(`[MATCH-QUEUE] ✓ Found waiting person: ${firstWaiting.userId}`);
      console.log(`[MATCH-QUEUE] Using their room: ${firstWaiting.roomId}`);

      const roomId = firstWaiting.roomId;
      
      // Create chat with both participants
      const participants = [firstWaiting.userId, userId];
      await Chat.create({
        roomId,
        participants,
        messages: [],
        peerIds: [],
      });

      // Remove the waiting request
      await MatchQueue.deleteOne({ _id: firstWaiting._id });
      
      console.log(`[MATCH-QUEUE] ✅ MATCH COMPLETE!`);
      console.log(`[MATCH-QUEUE] Room: ${roomId}`);
      console.log(`[MATCH-QUEUE] Participants: ${participants.length}`);
      console.log(`[MATCH-QUEUE] ================================================\n`);
      
      return NextResponse.json({ roomId, guestId });
    }

    // STEP 3: No one waiting - add THIS user to queue
    console.log(`[MATCH-QUEUE] Step 2: No one waiting, adding user to queue...`);
    
    const roomId = uuidv4();
    
    await MatchQueue.create({
      queueKey,
      userId,
      userType,
      roomId,
    });

    console.log(`[MATCH-QUEUE] ⏳ USER ADDED TO QUEUE`);
    console.log(`[MATCH-QUEUE] Queue Key: ${queueKey}`);
    console.log(`[MATCH-QUEUE] Room: ${roomId}`);
    console.log(`[MATCH-QUEUE] Waiting for match...`);
    console.log(`[MATCH-QUEUE] ================================================\n`);
    
    return NextResponse.json({ roomId, guestId });
  } catch (error) {
    console.error('[MATCH-QUEUE] ❌ ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}