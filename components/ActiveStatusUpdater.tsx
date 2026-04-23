"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function ActiveStatusUpdater() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated') return;

    // Update active status immediately
    const updateActive = async () => {
      try {
        await fetch('/api/user/active', { method: 'POST' });
      } catch (error) {
        console.error('Failed to update active status:', error);
      }
    };

    updateActive();

    // Update every 2 minutes
    const interval = setInterval(updateActive, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [status]);

  return null;
}