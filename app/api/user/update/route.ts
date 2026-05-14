import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { name, image, location, cameraPermission, microphonePermission, locationPermission } = await request.json();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;
    if (location !== undefined) updateData.location = location;
    if (cameraPermission !== undefined) updateData.cameraPermission = cameraPermission;
    if (microphonePermission !== undefined) updateData.microphonePermission = microphonePermission;
    if (locationPermission !== undefined) updateData.locationPermission = locationPermission;

    await User.findByIdAndUpdate(session.user.id, updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}