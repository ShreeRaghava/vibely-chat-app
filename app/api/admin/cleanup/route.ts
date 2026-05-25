import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MatchQueue from '@/lib/models/MatchQueue';
import MatchRequest from '@/lib/models/MatchRequest';

export async function POST(request: Request) {
  try {
    await dbConnect();

    // Delete all old match requests
    const matchResult = await MatchRequest.deleteMany({});
    console.log(`[CLEANUP] Deleted ${matchResult.deletedCount} old MatchRequests`);

    // Delete all queue entries
    const queueResult = await MatchQueue.deleteMany({});
    console.log(`[CLEANUP] Deleted ${queueResult.deletedCount} MatchQueue entries`);

    return NextResponse.json({
      success: true,
      matchRequestsDeleted: matchResult.deletedCount,
      queueEntriesDeleted: queueResult.deletedCount,
    });
  } catch (error) {
    console.error('[CLEANUP] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
