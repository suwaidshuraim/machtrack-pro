'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// The primary redirect is handled in next.config.ts (Vercel Edge level).
// This component is a client-side fallback in case the edge redirect is bypassed.
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="size-10 animate-spin text-primary" />
    </div>
  );
}
