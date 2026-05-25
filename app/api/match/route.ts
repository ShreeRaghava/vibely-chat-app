import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chat from '@/lib/models/Chat';
import MatchRequest from '@/lib/models/MatchRequest';
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

    console.log(`\n[MATCH] ========== NEW REQUEST ==========`);
    console.log(`[MATCH] User: ${currentUserId || 'NONE'}`);
    console.log(`[MATCH] Guest: ${guestId}`);
    console.log(`[MATCH] Type: ${chatType}`);

    // CRITICAL: Check if ONLY THIS USER already has a pending request
    // (not checking guest ID - that would prevent same user on different tabs)
    const existingUserRequest = hasUser 
      ? await MatchRequest.findOne({ user: currentUserId, chatType })
      : null;

    if (existingUserRequest) {
      console.log(`[MATCH] ✓ User already has pending request | Room: ${existingUserRequest.roomId}`);
      return NextResponse.json({ roomId: existingUserRequest.roomId });
    }

    // CRITICAL: Check if THIS GUEST already has a pending request
    const existingGuestRequest = hasGuest
      ? await MatchRequest.findOne({ guestId, chatType, user: null })
      : null;

    if (existingGuestRequest) {
      console.log(`[MATCH] ✓ Guest already has pending request | Room: ${existingGuestRequest.roomId}`);
      return NextResponse.json({ roomId: existingGuestRequest.roomId, guestId });
    }

    // STEP 1: Look for ANY waiting match request (other user waiting)
    console.log(`[MATCH] Step 1: Looking for waiting match...`);
    
    const matchQuery: any = {
      chatType,
    };

    // Never match with self
    if (hasUser) {
      matchQuery.user = { $ne: currentUserId };
    }
    if (hasGuest) {
      matchQuery.guestId = { $ne: guestId };
    }

    const waitingMatch = await MatchRequest.findOne(matchQuery);

    if (waitingMatch) {
      console.log(`[MATCH] ✓ Found waiting request from: ${waitingMatch.user || waitingMatch.guestId}`);
      console.log(`[MATCH] Using their room: ${waitingMatch.roomId}`);

      const roomId = waitingMatch.roomId;

      // Create chat with both participants
      const participants = [];
      if (hasUser) participants.push(currentUserId);
      if (hasGuest) participants.push(guestId);
      if (waitingMatch.user) participants.push(waitingMatch.user.toString());
      if (waitingMatch.guestId) participants.push(waitingMatch.guestId);

      await Chat.create({
        roomId,
        participants: [...new Set(participants)],
        messages: [],
        peerIds: [],
      });

      // Delete waiting request - match is complete
      await MatchRequest.deleteOne({ _id: waitingMatch._id });
      
      console.log(`[MATCH] ✅ MATCH COMPLETE!`);
      console.log(`[MATCH] Room: ${roomId}`);
      console.log(`[MATCH] Participants: ${participants.length}`);
      console.log(`[MATCH] ==========================================\n`);
      
      return NextResponse.json({ roomId, guestId: guestId || undefined });
    }

    // STEP 2: No match found, create new waiting request
    console.log(`[MATCH] Step 2: No match found, creating new waiting request...`);
    
    const roomId = uuidv4();
    
    const newRequest = await MatchRequest.create({
      user: hasUser ? currentUserId : null,
      guestId: hasGuest ? guestId : '',
      roomId,
      chatType,
      createdAt: new Date(),
    });

    console.log(`[MATCH] ⏳ WAITING FOR MATCH`);
    console.log(`[MATCH] Room: ${roomId}`);
    console.log(`[MATCH] Request ID: ${newRequest._id}`);
    console.log(`[MATCH] ==========================================\n`);
    
    return NextResponse.json({ roomId, guestId: guestId || undefined });
  } catch (error) {
    console.error('[MATCH] ❌ ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}