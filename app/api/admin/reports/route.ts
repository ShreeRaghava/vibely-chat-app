import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Report from '@/lib/models/Report';

export async function GET() {
  try {
    await dbConnect();
    const reports = await Report.find().populate('reporter reportedUser', 'name');
    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}