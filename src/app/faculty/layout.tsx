'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';

export default function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, profile, loading, initialized } = useUser();

  useEffect(() => {
    // Wait for auth to be fully initialized before any checks
    if (!initialized) return;

    // Guard: wait for both user AND profile before role check
    if (!user) {
      // Not logged in, redirect to faculty login
      router.push('/faculty-login');
      return;
    }

    // Only check role AFTER profile is loaded
    if (profile && profile.role !== 'faculty' && profile.role !== 'admin') {
      // Not faculty, redirect to student dashboard
      router.push('/dashboard');
      return;
    }
  }, [user, profile, loading, initialized, router]);

  // Show loading while not initialized OR while loading
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Guard: wait for user and profile before rendering anything else
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Only show access denied AFTER profile is confirmed loaded
  if (profile.role !== 'faculty' && profile.role !== 'admin') {
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