'use client';

import { useState, useEffect } from 'react';
import * as store from '@/lib/local-store';
import { applyConstraints, LocalCollectionRef, LocalQuery } from '@/lib/local-firestore';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: Error | null;
}

type LocalRef = (LocalCollectionRef | LocalQuery) & { __memo?: boolean };

/**
 * Poll interval for cross-device data sync.
 * Same-device writes emit an event that triggers an immediate refresh;
 * other devices are refreshed on the next poll tick.
 */
const POLL_MS = 4000;

export function useCollection<T = any>(
  memoizedTargetRefOrQuery: LocalRef | null | undefined,
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const collectionName = memoizedTargetRefOrQuery?._collection ?? null;
  const constraints =
    memoizedTargetRefOrQuery?._type === 'query'
      ? (memoizedTargetRefOrQuery as LocalQuery)._constraints
      : [];

  useEffect(() => {
    if (!collectionName) {
      setData(null);
      setIsLoading(false);
      return;
    }

    let active = true;

    async function load() {
      try {
        const all = await store.getAll<T>(collectionName!);
        if (!active) return;
        const filtered = applyConstraints(all, constraints) as WithId<T>[];
        setData(filtered);
        setIsLoading(false);
        setError(null);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setIsLoading(false);
      }
    }

    load();
    const intervalId = setInterval(load, POLL_MS);
    // Instant refresh for same-device writes
    const unsub = store.subscribe(collectionName, load);

    return () => {
      active = false;
      clearInterval(intervalId);
      unsub();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  return { data, isLoading, error };
}
