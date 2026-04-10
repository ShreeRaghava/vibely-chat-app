"use client";

import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface UserStats {
  chatsCount: number;
}

export default function Profile() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const userId = session?.user && (session.user as { id?: string }).id;
    if (userId) {
      fetch(`/api/user/${userId}`)
        .then((res) => res.json())
        .then(setStats)
        .catch((error) => console.error('Failed to fetch user stats:', error));
    }
  }, [session]);

  if (!session || !session.user) {
    return <div>Please login first</div>;
  }

  return (
    <div className="min-h-screen bg-nude-beige p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-lg mb-6"
        >
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden">
              <Image
                src={session.user.image || '/default-avatar.png'}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{session.user.name}</h1>
              <p className="text-dark-grey">{session.user.email}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <a href="/profile/edit" className="flex-1 text-center bg-black text-nude-beige px-4 py-2 rounded-lg">
              Edit Profile
            </a>
            <a href="/friends" className="flex-1 text-center bg-dark-grey text-nude-beige px-4 py-2 rounded-lg">
              Friends List
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-xl font-bold mb-4">Statistics</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats?.chatsCount || 0}</div>
              <div className="text-dark-grey">Total Chats</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}