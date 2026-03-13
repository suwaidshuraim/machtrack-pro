'use client';

import { useState, useEffect } from 'react';
import * as store from '@/lib/local-store';
import { LocalDocRef } from '@/lib/local-firestore';

type WithId<T> = T & { id: string };

export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: Error | null;
}

const POLL_MS = 4000;

export function useDoc<T = any>(
  memoizedDocRef: LocalDocRef | null | undefined,
): UseDocResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const collectionName = memoizedDocRef?._collection ?? null;
  const docId = memoizedDocRef?._id ?? null;

  useEffect(() => {
    if (!collectionName || !docId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    let active = true;

    async function load() {
      try {
        const item = await store.getById<T>(collectionName!, docId!);
        if (!active) return;
        setData(item as WithId<T> | null);
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
    const unsub = store.subscribe(collectionName, load);

    return () => {
      active = false;
      clearInterval(intervalId);
      unsub();
    };
  }, [collectionName, docId]);

  return { data, isLoading, error };
}
