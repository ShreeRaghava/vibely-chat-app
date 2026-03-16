"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Lobby() {
  const [chatType, setChatType] = useState<'text' | 'video'>('text');
  const [genderFilter, setGenderFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/payment/status');
          if (response.ok) {
            const data = await response.json();
            setIsPremium(data.isPremium || false);
          }
        } catch (error) {
          console.error('Error checking premium status:', error);
        }
      }
      setLoading(false);
    };

    checkPremiumStatus();
  }, [session]);

  const handleStart = () => {
    // If premium filters selected and not premium, show payment
    if ((genderFilter || locationFilter) && !isPremium) {
      router.push('/premium');
      return;
    }

    const queryParams = new URLSearchParams({
      chatType,
      gender: genderFilter,
      location: locationFilter,
    });

    router.push(`/matching?${queryParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-nude-beige p-4">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">Choose Your Preferences</h1>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Chat Type</label>
            <div className="flex space-x-4">
              <button
                onClick={() => setChatType('text')}
                className={`flex-1 py-2 px-4 rounded-lg ${chatType === 'text' ? 'bg-black text-nude-beige' : 'bg-nude-cream'}`}
              >
                Text Chat
              </button>
              <button
                onClick={() => setChatType('video')}
                className={`flex-1 py-2 px-4 rounded-lg ${chatType === 'video' ? 'bg-black text-nude-beige' : 'bg-nude-cream'}`}
              >
                Video Chat
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Gender Filter {!isPremium && '(Premium)'}</label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Location Filter {!isPremium && '(Premium)'}</label>
            <button
              onClick={() => router.push('/premium')}
              className="w-full p-2 border rounded-lg bg-nude-cream hover:bg-nude-beige transition-colors"
            >
              Select Location (Premium)
            </button>
          </div>
          
          <motion.button
            whileHover={{ y: -2, boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}
            whileTap={{ y: 0 }}
            onClick={handleStart}
            disabled={loading}
            className="w-full bg-black text-nude-beige py-3 px-4 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Start Chatting'}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}