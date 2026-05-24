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
    const location = (body.location || '').toString().trim().toLowerCase();
    const gender = (body.gender || '').toString().trim().toLowerCase();
    const guestId = (body.guestId || '').toString().trim();

    const currentUserId = session?.user?.id || '';
    const hasUser = Boolean(currentUserId);
    const hasGuest = Boolean(guestId);

    if (!hasUser && !hasGuest) {
      return NextResponse.json({ error: 'Guest ID or login required' }, { status: 400 });
    }

    console.log(`[MATCH] NEW REQUEST | User: ${currentUserId || 'NONE'} | Guest: ${guestId} | Type: ${chatType}`);

    // Check if this user/guest already has a pending match request
    const existingRequestFilter: any = { $or: [] };
    if (hasUser) existingRequestFilter.$or.push({ user: currentUserId });
    if (hasGuest) existingRequestFilter.$or.push({ guestId });

    const existingRequest = await MatchRequest.findOne(existingRequestFilter);
    if (existingRequest) {
      console.log(`[MATCH] ✓ EXISTING REQUEST FOUND | Room: ${existingRequest.roomId}`);
      return NextResponse.json({ roomId: existingRequest.roomId, guestId: guestId || undefined });
    }

    // Build the matching criteria - SIMPLE: just match by chatType
    let matchQuery: any = {
      chatType,
    };

    // Exclude self
    if (hasUser) {
      matchQuery.user = { $ne: currentUserId };
    }
    if (hasGuest) {
      matchQuery.guestId = { $ne: guestId };
    }

    console.log(`[MATCH] SEARCHING | Query: ${JSON.stringify(matchQuery)}`);

    // Try to find a match
    const matchingRequest = await MatchRequest.findOne(matchQuery);

    if (matchingRequest) {
      const roomId = matchingRequest.roomId;
      console.log(`[MATCH] ✓ FOUND MATCH | Using Room: ${roomId} | Waiting User: ${matchingRequest.user || matchingRequest.guestId}`);
      
      const participants = [];
      if (hasUser) participants.push(currentUserId);
      if (hasGuest) participants.push(guestId);
      if (matchingRequest.user) participants.push(matchingRequest.user.toString());
      if (matchingRequest.guestId) participants.push(matchingRequest.guestId);

      await Chat.create({
        roomId,
        participants: [...new Set(participants)],
        messages: [],
        peerIds: [],
      });

      await MatchRequest.deleteOne({ _id: matchingRequest._id });
      console.log(`[MATCH] ✓ MATCH COMPLETE | Room: ${roomId} | Participants: ${participants.length}`);
      return NextResponse.json({ roomId, guestId: guestId || undefined });
    }

    // No match found - create new match request with UNIQUE room
    const roomId = uuidv4();
    console.log(`[MATCH] ⏳ NO MATCH | Creating new request | Room: ${roomId} | User: ${currentUserId || guestId}`);
    
    await MatchRequest.create({
      user: hasUser ? currentUserId : null,
      guestId: guestId || '',
      roomId,
      chatType,
      location: location || '',
      gender: gender || '',
    });

    console.log(`[MATCH] ⏳ WAITING FOR MATCH | Room: ${roomId}`);
    return NextResponse.json({ roomId, guestId: guestId || undefined });
  } catch (error) {
    console.error('[MATCH] ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}