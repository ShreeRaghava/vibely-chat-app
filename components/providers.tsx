"use client";

import { SessionProvider } from 'next-auth/react';
import { ActiveStatusUpdater } from './ActiveStatusUpdater';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ActiveStatusUpdater />
      {children}
    </SessionProvider>
  );
}