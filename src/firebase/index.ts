
'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  return { firebaseApp, firestore, auth };
}

export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';
export { useFirestore, useAuth, useFirebaseApp, FirebaseProvider } from './provider';
export { FirebaseClientProvider } from './client-provider';

import { useMemo } from 'react';
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  return useMemo(factory, deps);
}
