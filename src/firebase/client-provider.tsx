//src\firebase\client-provider.tsx

'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

type FirebaseServices = ReturnType<typeof initializeFirebase>;

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // Initialize Firebase in useEffect so it NEVER runs during SSR.
  // Firebase Web SDK accesses browser APIs (IndexedDB, localStorage) that do
  // not exist in Vercel's Node.js runtime and would crash the server render.
  const [services, setServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    setServices(initializeFirebase());
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={services?.firebaseApp ?? null}
      auth={services?.auth ?? null}
      firestore={services?.firestore ?? null}
    >
      {children}
    </FirebaseProvider>
  );
}