"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  image?: string;
}

type TabType = 'friends' | 'received' | 'pending';

export default function FriendsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<TabType>('friends');
  const [friends, setFriends] = useState<User[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchAllData();
    }
  }, [status, router]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [friendsRes, receivedRes, pendingRes] = await Promise.all([
        fetch('/api/friends?type=friends'),
        fetch('/api/friends?type=received'),
        fetch('/api/friends?type=pending'),
      ]);

      if (friendsRes.ok) {
        const data = await friendsRes.json();
        setFriends(data.friends || []);
      }
      if (receivedRes.ok) {
        const data = await receivedRes.json();
        setReceivedRequests(data.received || []);
      }
      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPendingRequests(data.pending || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Could not load friends data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter an email address.');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-request', email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send friend request');
        return;
      }

      setSuccess('Friend request sent!');
      setEmail('');
      await fetchAllData();
    } catch (err) {
      console.error('Error:', err);
      setError('Could not send friend request.');
    } finally {
      setSaving(false);
    }
  };

  const handleAcceptRequest = async (friendId: string) => {
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', friendId }),
      });

      if (res.ok) {
        setSuccess('Friend request accepted!');
        await fetchAllData();
      } else {
        setError('Failed to accept request');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Could not accept request.');
    }
  };

  const handleRejectRequest = async (friendId: string) => {
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', friendId }),
      });

      if (res.ok) {
        setSuccess('Friend request rejected');
        await fetchAllData();
      } else {
        setError('Failed to reject request');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Could not reject request.');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return;

    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', friendId }),
      });

      if (res.ok) {
        setSuccess('Friend removed');
        await fetchAllData();
      } else {
        setError('Failed to remove friend');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Could not remove friend.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-nude-beige flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const tabCounts = {
    friends: friends.length,
    received: receivedRequests.length,
    pending: pendingRequests.length,
  };

  return (
    <div className="min-h-screen bg-nude-beige p-4">
      <div className="max-w-3xl mx-auto">
        {/* Add Friend Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-lg mb-6"
        >
          <h1 className="text-2xl font-bold mb-2">Friends</h1>
          <p className="text-dark-grey mb-4">Send friend requests and manage your connections.</p>

          <form onSubmit={handleSendRequest} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Friend's email"
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              disabled={saving}
              className="bg-black text-nude-beige px-6 py-3 rounded-lg font-semibold disabled:opacity-50 hover:bg-gray-800 transition"
            >
              {saving ? 'Sending...' : 'Send Request'}
            </button>
          </form>

          {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
          {success && <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300">
          {(['friends', 'received', 'pending'] as TabType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 font-semibold transition ${
                tab === t
                  ? 'text-black border-b-2 border-black'
                  : 'text-dark-grey hover:text-black'
              }`}
            >
              {t === 'friends' && 'Friends'}
              {t === 'received' && 'Friend Requests'}
              {t === 'pending' && 'Pending'}
              {tabCounts[t] > 0 && (
                <span className="ml-2 bg-black text-white rounded-full px-2 py-0.5 text-sm">
                  {tabCounts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Friends Tab */}
        {tab === 'friends' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4">Your Friends ({friends.length})</h2>
            {loading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : friends.length === 0 ? (
              <div className="text-center text-dark-grey py-8">
                <p className="mb-2">No friends yet</p>
                <p className="text-sm">Send friend requests to start connecting!</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {friends.map((friend) => (
                  <motion.li
                    key={friend._id || friend.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50 transition"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{friend.name}</div>
                      <div className="text-sm text-dark-grey">{friend.email}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveFriend(friend._id || friend.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-semibold transition"
                    >
                      Remove
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        )}

        {/* Received Requests Tab */}
        {tab === 'received' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4">Friend Requests ({receivedRequests.length})</h2>
            {loading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : receivedRequests.length === 0 ? (
              <div className="text-center text-dark-grey py-8">
                <p>No pending friend requests</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {receivedRequests.map((user) => (
                  <motion.li
                    key={user._id || user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50 transition"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-dark-grey">{user.email}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(user._id || user.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(user._id || user.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        Reject
                      </button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        )}

        {/* Pending Requests Tab */}
        {tab === 'pending' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4">Pending Requests ({pendingRequests.length})</h2>
            {loading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center text-dark-grey py-8">
                <p>No pending requests sent</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {pendingRequests.map((user) => (
                  <motion.li
                    key={user._id || user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50 transition"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-dark-grey">{user.email}</div>
                    </div>
                    <div className="text-xs text-dark-grey bg-yellow-50 px-3 py-1 rounded-full">
                      Pending
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
