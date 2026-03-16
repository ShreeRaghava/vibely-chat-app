"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Matching() {
  const [dots, setDots] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [searching, setSearching] = useState(true);
  const [isMatched, setIsMatched] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Searching for a match...');
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    const startMatch = async () => {
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
      const chatType = params.get('chatType') || 'text';
      const gender = params.get('gender') || '';
      const location = params.get('location') || '';

      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatType, gender, location }),
      });

      const data = await res.json();
      setRoomId(data.roomId);

      // Start polling for match results
      pollMatchStatus(data.roomId);
    };

    startMatch();

    return () => {
      clearInterval(interval);
    };
  }, [router]);

  const pollMatchStatus = (room: string) => {
    setSearching(true);
    setStatusMessage('Searching for a match...');

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/match/status?roomId=${room}`);
        const data = await res.json();

        if (data.matched) {
          setIsMatched(true);
          setSearching(false);
          clearInterval(interval);
          router.push(`/room/${room}`);
          return;
        }

        if (data.notFound) {
          setStatusMessage('Still searching...');
        }
      } catch (error) {
        console.error('Match status error:', error);
        setStatusMessage('Still searching...');
      }
    }, 3000);

    return () => clearInterval(interval);
  };

  const handleCancel = async () => {
    if (!roomId) {
      router.push('/lobby');
      return;
    }
    // Cancel in background
    fetch('/api/match/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId }),
    }).catch(console.error);
    
    setSearching(false);
    router.push('/lobby');
  };

  return (
    <div className="min-h-screen bg-nude-beige flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md w-full"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-32 h-32 bg-nude-cream rounded-full mx-auto mb-8 flex items-center justify-center"
        >
          <span className="text-4xl">🔍</span>
        </motion.div>
        <h1 className="text-3xl font-bold mb-4">{searching ? `Finding a match${dots}` : 'Searching stopped'}</h1>
        <p className="text-dark-grey mb-6">{searching ? statusMessage : 'You can return to the lobby anytime.'}</p>

        {searching && (
          <button
            onClick={handleCancel}
            className="w-full bg-black text-nude-beige py-3 px-4 rounded-lg font-semibold"
          >
            Cancel Search
          </button>
        )}
      </motion.div>
    </div>
  );
}