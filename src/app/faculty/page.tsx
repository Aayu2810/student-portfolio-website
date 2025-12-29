'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FacultyPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the faculty dashboard
    router.push('/faculty/dashboard');
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
      <div className="text-white text-xl">Redirecting to Faculty Dashboard...</div>
    </div>
  );
}