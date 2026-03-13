'use client';

import React, { useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { seedAllCollections } from '@/lib/local-store';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // Seed localStorage with mock data on first browser load.
  useEffect(() => {
    seedAllCollections();
  }, []);

  return <FirebaseProvider>{children}</FirebaseProvider>;
}
