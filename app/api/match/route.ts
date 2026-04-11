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

    // Normalize and sanitize
    const normalizedLocation = location;
    const normalizedGender = gender;

    const currentUserId = session?.user?.id || '';
    const hasUser = Boolean(currentUserId);
    const hasGuest = Boolean(guestId);

    if (!hasUser && !hasGuest) {
      return NextResponse.json({ error: 'Guest ID or login required' }, { status: 400 });
    }

    const existingRequestFilter: any = { $or: [] };
    if (hasUser) existingRequestFilter.$or.push({ user: currentUserId });
    if (hasGuest) existingRequestFilter.$or.push({ guestId });

    const existingRequest = await MatchRequest.findOne(existingRequestFilter);
    if (existingRequest) {
      return NextResponse.json({ roomId: existingRequest.roomId, guestId: guestId || undefined });
    }

    const locationCriteria = normalizedLocation
      ? { $in: [normalizedLocation, ''] }
      : { $exists: true };

    // If a gender is selected, match opposite-gender requests or open requests.
    // If no gender is selected, allow any gender.
    const oppositeGender = normalizedGender === 'male'
      ? 'female'
      : normalizedGender === 'female'
      ? 'male'
      : '';

    const genderCriteria = normalizedGender
      ? { $in: [oppositeGender, ''] }
      : { $exists: true };

    const matchQuery: any = {
      location: locationCriteria,
      gender: genderCriteria,
      chatType,
    };

    const excludeSelf: any = { $nor: [] };
    if (hasUser) excludeSelf.$nor.push({ user: currentUserId });
    if (hasGuest) excludeSelf.$nor.push({ guestId });
    if (excludeSelf.$nor.length) {
      matchQuery.$and = [excludeSelf];
    }

    const matchingRequest = await MatchRequest.findOne(matchQuery);

    if (matchingRequest) {
      const roomId = matchingRequest.roomId;
      const participants = [];
      if (hasUser) participants.push(currentUserId);
      if (hasGuest) participants.push(guestId);
      if (matchingRequest.user) participants.push(matchingRequest.user.toString());
      if (matchingRequest.guestId) participants.push(matchingRequest.guestId);

      await Chat.create({
        participants: [...new Set(participants)],
        roomId,
        location: normalizedLocation,
        gender: normalizedGender,
      });

      await MatchRequest.deleteOne({ _id: matchingRequest._id });
      return NextResponse.json({ roomId, guestId: guestId || undefined });
    }

    const roomId = uuidv4();
    await MatchRequest.create({
      user: hasUser ? currentUserId : undefined,
      guestId: guestId || '',
      roomId,
      chatType,
      location: normalizedLocation,
      gender: normalizedGender,
    });

    return NextResponse.json({ roomId, guestId: guestId || undefined });
  } catch (error) {
    console.error('Match error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}