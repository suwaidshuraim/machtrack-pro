'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo } from 'react';
import { LOCAL_FIRESTORE, type Firestore } from '@/lib/local-firestore';

// ── Context types (kept compatible with existing page code) ───────────────────

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: object | null;
  firestore: Firestore | null;
  auth: object | null;
  user: { displayName: string | null; email: string | null; uid: string } | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseServicesAndUser {
  firebaseApp: object | null;
  firestore: Firestore | null;
  auth: object | null;
  user: { displayName: string | null; email: string | null; uid: string } | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface UserHookResult {
  user: { displayName: string | null; email: string | null; uid: string } | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Stable mock context value - never changes so no unnecessary re-renders.
const MOCK_CONTEXT: FirebaseContextState = {
  areServicesAvailable: true,
  firebaseApp: { _local: true },
  firestore: LOCAL_FIRESTORE,
  auth: { _local: true },
  user: { displayName: 'Floor Operator', email: 'operator@factory.com', uid: 'local-user' },
  isUserLoading: false,
  userError: null,
};

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp?: object | null;
  firestore?: Firestore | null;
  auth?: object | null;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => (
  <FirebaseContext.Provider value={MOCK_CONTEXT}>
    {children}
  </FirebaseContext.Provider>
);

// ── Hooks ─────────────────────────────────────────────────────────────────────

export const useFirebase = (): FirebaseServicesAndUser => {
  return MOCK_CONTEXT;
};

export const useAuth = () => MOCK_CONTEXT.auth;

export const useFirestore = (): Firestore => LOCAL_FIRESTORE;

export const useFirebaseApp = () => MOCK_CONTEXT.firebaseApp;

type MemoFirebase<T> = T & { __memo?: boolean };

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | MemoFirebase<T> {
  const memoized = useMemo(factory, deps);
  if (typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  return memoized;
}

export const useUser = (): UserHookResult => ({
  user: MOCK_CONTEXT.user,
  isUserLoading: false,
  userError: null,
});
