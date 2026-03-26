import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chat from '@/lib/models/Chat';
import MatchRequest from '@/lib/models/MatchRequest';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const chatType = (body.chatType || 'text').toString().trim().toLowerCase();
    const location = (body.location || '').toString().trim().toLowerCase();
    const gender = (body.gender || '').toString().trim().toLowerCase();

    // Normalize and sanitize
    const normalizedLocation = location;
    const normalizedGender = gender;

    // If a user already has a pending request, return the same roomId
    const existingRequest = await MatchRequest.findOne({ user: session.user.id });
    if (existingRequest) {
      return NextResponse.json({ roomId: existingRequest.roomId });
    }

    // If user is not premium, ignore premium filters
    const user = session.user as { id: string; isPremium?: boolean };
    const isPremium = user.isPremium;
    const allowedLocation = isPremium ? normalizedLocation : '';
    const allowedGender = isPremium ? normalizedGender : '';

    // Find a matching request
    const matchingRequest = await MatchRequest.findOne({
      location: allowedLocation,
      gender: allowedGender,
      user: { $ne: session.user.id },
      chatType: chatType,
    });

    if (matchingRequest) {
      // Match found
      const roomId = matchingRequest.roomId;

      // Create chat record to store room data
      await Chat.create({
        participants: [session.user.id, matchingRequest.user],
        roomId,
        location: allowedLocation,
        gender: allowedGender,
      });

      // Remove the request from queue
      await MatchRequest.deleteOne({ _id: matchingRequest._id });

      return NextResponse.json({ roomId });
    }

    // No match found, create a waiting request
    const roomId = uuidv4();
    await MatchRequest.create({
      user: session.user.id,
      roomId,
      chatType,
      location: allowedLocation,
      gender: allowedGender,
    });

    return NextResponse.json({ roomId });
  } catch (error) {
    console.error('Match error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}