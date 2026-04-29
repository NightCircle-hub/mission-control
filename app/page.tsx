'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Root() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
      <p className="text-white">Redirecting to Dashboard...</p>
    </div>
  );
}
