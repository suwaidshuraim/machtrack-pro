'use client';

import { useState, useEffect, useMemo } from 'react';
import * as store from '@/lib/local-store';
import { LocalDocRef } from '@/lib/local-firestore';

type WithId<T> = T & { id: string };

export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: Error | null;
}

export function useDoc<T = any>(
  memoizedDocRef: LocalDocRef | null | undefined,
): UseDocResult<T> {
  const [tick, setTick] = useState(0);

  const collectionName = memoizedDocRef?._collection ?? null;

  useEffect(() => {
    if (!collectionName) return;
    const unsub = store.subscribe(collectionName, () => setTick(t => t + 1));
    return unsub;
  }, [collectionName]);

  const data = useMemo(() => {
    if (!memoizedDocRef) return null;
    return store.getById<T>(memoizedDocRef._collection, memoizedDocRef._id) as WithId<T> | null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoizedDocRef, tick]);

  return { data, isLoading: false, error: null };
}
