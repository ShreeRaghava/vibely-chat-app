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

    console.log('Match request:', { currentUserId, guestId, chatType, gender, location });

    // Check if this user/guest already has a pending match request
    const existingRequestFilter: any = { $or: [] };
    if (hasUser) existingRequestFilter.$or.push({ user: currentUserId });
    if (hasGuest) existingRequestFilter.$or.push({ guestId });

    const existingRequest = await MatchRequest.findOne(existingRequestFilter);
    if (existingRequest) {
      console.log('Returning existing match request:', existingRequest.roomId);
      return NextResponse.json({ roomId: existingRequest.roomId, guestId: guestId || undefined });
    }

    // Build the matching criteria
    let matchQuery: any = {
      chatType,
    };

    // Location matching: if user has location, prefer same location; otherwise match any
    if (location) {
      matchQuery.location = location;
    }

    // Gender matching: if specified, match opposite gender; otherwise match any
    if (gender) {
      const oppositeGender = gender === 'male' ? 'female' : 'male';
      matchQuery.gender = { $in: [oppositeGender, ''] };
    }

    // Exclude self
    if (hasUser) {
      matchQuery.user = { $ne: currentUserId };
    }
    if (hasGuest) {
      matchQuery.guestId = { $ne: guestId };
    }

    console.log('Looking for match with query:', JSON.stringify(matchQuery));

    // Try to find an exact match first
    const matchingRequest = await MatchRequest.findOne(matchQuery);

    if (matchingRequest) {
      console.log('Found matching request:', matchingRequest.roomId);
      
      const roomId = matchingRequest.roomId;
      const participants = [];
      if (hasUser) participants.push(currentUserId);
      if (hasGuest) participants.push(guestId);
      if (matchingRequest.user) participants.push(matchingRequest.user.toString());
      if (matchingRequest.guestId) participants.push(matchingRequest.guestId);

      await Chat.create({
        participants: [...new Set(participants)],
        roomId,
        location: location || matchingRequest.location || '',
        gender: gender || matchingRequest.gender || '',
      });

      await MatchRequest.deleteOne({ _id: matchingRequest._id });
      console.log('Match complete! Room:', roomId);
      return NextResponse.json({ roomId, guestId: guestId || undefined });
    }

    // If no exact match, try broader search (any gender/location)
    const broaderQuery: any = {
      chatType,
      $nor: [],
    };
    
    if (hasUser) {
      broaderQuery.$nor.push({ user: currentUserId });
    }
    if (hasGuest) {
      broaderQuery.$nor.push({ guestId });
    }

    const broaderMatch = await MatchRequest.findOne(broaderQuery);
    
    if (broaderMatch) {
      console.log('Found broader match:', broaderMatch.roomId);
      
      const roomId = broaderMatch.roomId;
      const participants = [];
      if (hasUser) participants.push(currentUserId);
      if (hasGuest) participants.push(guestId);
      if (broaderMatch.user) participants.push(broaderMatch.user.toString());
      if (broaderMatch.guestId) participants.push(broaderMatch.guestId);

      await Chat.create({
        participants: [...new Set(participants)],
        roomId,
        location: location || broaderMatch.location || '',
        gender: gender || broaderMatch.gender || '',
      });

      await MatchRequest.deleteOne({ _id: broaderMatch._id });
      console.log('Broader match complete! Room:', roomId);
      return NextResponse.json({ roomId, guestId: guestId || undefined });
    }

    // No match found, create new match request
    const roomId = uuidv4();
    console.log('No match found, creating new request:', roomId);
    
    await MatchRequest.create({
      user: hasUser ? currentUserId : undefined,
      guestId: guestId || '',
      roomId,
      chatType,
      location: location || '',
      gender: gender || '',
    });

    return NextResponse.json({ roomId, guestId: guestId || undefined });
  } catch (error) {
    console.error('Match error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}