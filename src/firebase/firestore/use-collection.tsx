'use client';

import { useState, useEffect, useMemo } from 'react';
import * as store from '@/lib/local-store';
import { applyConstraints, LocalCollectionRef, LocalQuery } from '@/lib/local-firestore';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: Error | null;
}

type LocalRef = (LocalCollectionRef | LocalQuery) & { __memo?: boolean };

export function useCollection<T = any>(
  memoizedTargetRefOrQuery: LocalRef | null | undefined,
): UseCollectionResult<T> {
  const [tick, setTick] = useState(0);

  const collectionName = memoizedTargetRefOrQuery?._collection ?? null;

  useEffect(() => {
    if (!collectionName) return;
    const unsub = store.subscribe(collectionName, () => setTick(t => t + 1));
    return unsub;
  }, [collectionName]);

  const data = useMemo(() => {
    if (!collectionName) return null;
    const all = store.getAll<T>(collectionName);
    const constraints = memoizedTargetRefOrQuery?._type === 'query'
      ? (memoizedTargetRefOrQuery as LocalQuery)._constraints
      : [];
    return applyConstraints(all, constraints) as WithId<T>[];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, tick]);

  return { data, isLoading: false, error: null };
}
