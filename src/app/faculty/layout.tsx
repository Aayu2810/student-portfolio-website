'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';

export default function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, profile, loading } = useUser();

  useEffect(() => {
    const checkFacultyAccess = async () => {
      if (!loading) {
        if (!user) {
          // Not logged in, redirect to faculty login
          router.push('/(auth)/faculty-login');
          return;
        }

        if (profile && profile.role !== 'faculty' && profile.role !== 'admin') {
          // Not faculty, redirect to student dashboard
          router.push('/(dashboard)/dashboard');
          return;
        }
      }
    };

    checkFacultyAccess();
  }, [user, profile, loading, router]);

  if (loading || (!user && !loading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (profile && profile.role !== 'faculty' && profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-red-500 text-xl">Access denied. Faculty access only.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e]">
      {children}
    </div>
  );
}