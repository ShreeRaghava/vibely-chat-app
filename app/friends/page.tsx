"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Friend {
  id: string;
  name: string;
  email: string;
  isOnline?: boolean;
}

export default function FriendsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchFriends();
    }
  }, [status, router]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/friends');
      if (!res.ok) {
        throw new Error('Failed to load friends');
      }
      const data = await res.json();
      setFriends(data.friends || []);
    } catch (err) {
      console.error('Error fetching friends:', err);
      setError('Could not load your friends.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter an email address.');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to add friend');
        return;
      }

      setFriends((prev) => [...prev, data.friend]);
      setEmail('');
    } catch (err) {
      console.error('Add friend error:', err);
      setError('Could not add friend.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-nude-beige flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>Loading your friends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nude-beige p-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-lg mb-6"
        >
          <h1 className="text-2xl font-bold mb-2">Friends List</h1>
          <p className="text-dark-grey mb-4">Add friends by email and see who you can chat with.</p>

          <form onSubmit={handleAddFriend} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Friend&apos;s email"
              className="flex-1 p-3 border rounded-lg"
            />
            <button
              type="submit"
              disabled={saving}
              className="bg-black text-nude-beige px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Friend'}
            </button>
          </form>

          {error && <div className="mt-4 text-red-600">{error}</div>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-xl font-bold mb-4">Your Friends</h2>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : friends.length === 0 ? (
            <div className="text-dark-grey">You haven&apos;t added any friends yet.</div>
          ) : (
            <ul className="space-y-3">
              {friends.map((friend) => (
                <li key={friend.id} className="border p-3 rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                        <span className="text-lg font-semibold">{friend.name.charAt(0).toUpperCase()}</span>
                      </div>
                      {friend.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">{friend.name}</div>
                      <div className="text-sm text-dark-grey">{friend.email}</div>
                    </div>
                  </div>
                  <div className="text-xs text-dark-grey">
                    {friend.isOnline ? (
                      <span className="text-green-600 font-medium">● Online</span>
                    ) : (
                      <span className="text-slate-400">Offline</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </div>
  );
}
