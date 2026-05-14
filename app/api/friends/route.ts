import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'friends'; // 'friends', 'pending', 'received'

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (type === 'friends') {
      const friends = await User.find({ _id: { $in: user.friends } }, 'name email image');
      return NextResponse.json({ friends });
    } else if (type === 'pending') {
      const pending = await User.find({ _id: { $in: user.requestsSentTo } }, 'name email image');
      return NextResponse.json({ pending });
    } else if (type === 'received') {
      const received = await User.find({ _id: { $in: user.friendRequests } }, 'name email image');
      return NextResponse.json({ received });
    }

    return NextResponse.json({ friends: [], pending: [], received: [] });
  } catch (error) {
    console.error('Friends GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, email, friendId } = await request.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    await connectDB();

    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'send-request') {
      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      const targetUser = await User.findOne({ email });
      if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (currentUser._id.equals(targetUser._id)) {
        return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });
      }

      if (currentUser.friends?.includes(targetUser._id)) {
        return NextResponse.json({ error: 'Already friends' }, { status: 400 });
      }

      if (currentUser.requestsSentTo?.includes(targetUser._id)) {
        return NextResponse.json({ error: 'Friend request already sent' }, { status: 400 });
      }

      currentUser.requestsSentTo = [...(currentUser.requestsSentTo || []), targetUser._id];
      await currentUser.save();

      targetUser.friendRequests = [...(targetUser.friendRequests || []), currentUser._id];
      await targetUser.save();

      return NextResponse.json({ message: 'Friend request sent', user: { id: targetUser._id, name: targetUser.name, email: targetUser.email } });
    } else if (action === 'accept') {
      if (!friendId) {
        return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 });
      }

      const friendUser = await User.findById(friendId);
      if (!friendUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (!currentUser.friendRequests?.includes(friendUser._id)) {
        return NextResponse.json({ error: 'No pending request from this user' }, { status: 400 });
      }

      currentUser.friends = [...(currentUser.friends || []), friendUser._id];
      currentUser.friendRequests = currentUser.friendRequests.filter((id: any) => !id.equals(friendUser._id));
      await currentUser.save();

      friendUser.friends = [...(friendUser.friends || []), currentUser._id];
      friendUser.requestsSentTo = friendUser.requestsSentTo.filter((id: any) => !id.equals(currentUser._id));
      await friendUser.save();

      return NextResponse.json({ message: 'Friend request accepted', friend: { id: friendUser._id, name: friendUser.name, email: friendUser.email } });
    } else if (action === 'reject') {
      if (!friendId) {
        return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 });
      }

      const friendUser = await User.findById(friendId);
      if (!friendUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (!currentUser.friendRequests?.includes(friendUser._id)) {
        return NextResponse.json({ error: 'No pending request from this user' }, { status: 400 });
      }

      currentUser.friendRequests = currentUser.friendRequests.filter((id: any) => !id.equals(friendUser._id));
      await currentUser.save();

      friendUser.requestsSentTo = friendUser.requestsSentTo.filter((id: any) => !id.equals(currentUser._id));
      await friendUser.save();

      return NextResponse.json({ message: 'Friend request rejected' });
    } else if (action === 'remove') {
      if (!friendId) {
        return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 });
      }

      const friendUser = await User.findById(friendId);
      if (!friendUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      currentUser.friends = currentUser.friends.filter((id: any) => !id.equals(friendUser._id));
      await currentUser.save();

      friendUser.friends = friendUser.friends.filter((id: any) => !id.equals(currentUser._id));
      await friendUser.save();

      return NextResponse.json({ message: 'Friend removed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Friends POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
