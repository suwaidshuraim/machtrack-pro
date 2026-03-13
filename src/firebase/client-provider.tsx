'use client';

import React, { useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { seedAllCollections } from '@/lib/local-store';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // Initialize empty collections on first browser load (no demo data).
  useEffect(() => {
    seedAllCollections();
    // ── Developer Storage Info ──────────────────────────────────────────────
    // All app data is stored in browser localStorage.
    // To inspect: DevTools → Application → Local Storage → http://localhost:9002
    // Keys:
    //   machtrack_machines          – registered machines
    //   machtrack_lines             – production lines
    //   machtrack_transfers         – transfer history
    //   machtrack_maintenanceTasks  – maintenance records
    //   machtrack_machineTypes      – equipment categories (with images)
    //
    // Example machine record:
    //   { id, name, brand, modelNo, serialNumber, type, location, status, ... }
    console.groupCollapsed('%c[MachTrack] localStorage data store', 'color:#2563eb;font-weight:bold');
    console.log('Keys in use:');
    const keys = [
      'machtrack_machines',
      'machtrack_lines',
      'machtrack_transfers',
      'machtrack_maintenanceTasks',
      'machtrack_machineTypes',
    ];
    keys.forEach(k => {
      try {
        const val = localStorage.getItem(k);
        const count = val ? JSON.parse(val).length : 0;
        console.log(`  ${k}: ${count} records`);
      } catch { /* noop */ }
    });
    console.log('Inspect: DevTools → Application → Local Storage → http://localhost:9002');
    console.groupEnd();
  }, []);

  return <FirebaseProvider>{children}</FirebaseProvider>;
}
