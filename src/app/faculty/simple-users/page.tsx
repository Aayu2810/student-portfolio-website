'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SimpleUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsersDirect = async () => {
      console.log('=== SIMPLE USERS: Direct fetch from profiles ===');
      
      const supabase = createClient();
      
      // Direct, simple query - no RLS bypass needed for faculty
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('first_name');
      
      console.log('Raw profiles data:', data);
      console.log('Raw profiles error:', error);
      
      if (error) {
        console.error('Profiles query failed:', error);
        setError(error.message);
        setUsers([]);
      } else if (data) {
        console.log('Found users:', data.length);
        setUsers(data);
      } else {
        console.log('No data returned');
        setUsers([]);
      }
      
      setLoading(false);
    };

    fetchUsersDirect();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold">Loading Users...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">All Users in Database</h1>
      
      {error && (
        <div className="mb-6 bg-red-900/30 p-4 rounded-lg border border-red-700">
          <h3 className="text-lg font-bold mb-2">Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">
          Users Found: {users.length}
        </h2>
        
        {users.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No users found in profiles table
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-400 text-sm">ID:</span>
                    <div className="font-mono text-xs break-all">{user.id}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Name:</span>
                    <div className="font-medium">{user.first_name} {user.last_name}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Email:</span>
                    <div className="font-medium">{user.email}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Role:</span>
                    <div className="font-medium">{user.role || 'NULL'}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Created:</span>
                    <div className="text-sm">{user.created_at}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-blue-900/30 p-4 rounded-lg border border-blue-700">
        <h3 className="text-lg font-bold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>If you see users above, the profiles table is working</li>
          <li>If you see "aayushi" and "kruthi", copy their IDs</li>
          <li>If no users shown, run the SQL scripts to add them</li>
          <li>Check browser console for detailed logs</li>
        </ol>
      </div>
    </div>
  );
}
