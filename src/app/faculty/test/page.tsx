'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      const supabase = createClient();
      const testLogs: string[] = [];
      
      testLogs.push('=== STARTING TESTS ===');
      
      // Test 1: Check if we can connect to Supabase
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        testLogs.push(`Auth test: ${user ? 'SUCCESS - User: ' + user.email : 'FAILED - ' + authError?.message}`);
      } catch (e) {
        testLogs.push('Auth test FAILED: ' + e);
      }
      
      // Test 2: Try to access profiles table
      try {
        testLogs.push('Testing profiles table access...');
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .single();
        
        testLogs.push(`Profiles count result: ${error ? 'ERROR - ' + error.message : 'SUCCESS - Count: ' + data?.count}`);
      } catch (e) {
        testLogs.push('Profiles test FAILED: ' + e);
      }
      
      // Test 3: Try simple query
      try {
        testLogs.push('Testing simple profiles query...');
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email')
          .limit(5);
        
        testLogs.push(`Simple query result: ${profilesError ? 'ERROR - ' + profilesError.message : 'SUCCESS - Found ' + profilesData?.length + ' users'}`);
        
        if (profilesData) {
          profilesData.forEach((user, index) => {
            testLogs.push(`User ${index + 1}: ${user.email} (${user.id})`);
          });
        }
      } catch (e) {
        testLogs.push('Simple query FAILED: ' + e);
      }
      
      // Test 4: Check table exists
      try {
        testLogs.push('Testing table existence...');
        const { data: tableData, error: tableError } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);
        
        testLogs.push(`Table test: ${tableError ? 'ERROR - ' + tableError.message : 'SUCCESS - Table exists'}`);
      } catch (e) {
        testLogs.push('Table test FAILED: ' + e);
      }
      
      testLogs.push('=== TESTS COMPLETE ===');
      setLogs(testLogs);
      setLoading(false);
    };

    runTests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold">Running Tests...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Connection Test Results</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Test Logs:</h2>
        <div className="space-y-2 font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index} className={`p-2 rounded ${
              log.includes('SUCCESS') ? 'bg-green-900' : 
              log.includes('ERROR') || log.includes('FAILED') ? 'bg-red-900' : 
              'bg-gray-700'
            }`}>
              {log}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8 bg-blue-900/30 p-4 rounded-lg border border-blue-700">
        <h3 className="text-lg font-bold mb-2">What to Check:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>If all tests show SUCCESS - database connection is working</li>
          <li>If auth test fails - check Supabase configuration</li>
          <li>If profiles tests fail - check RLS policies</li>
          <li>If table test fails - profiles table doesn't exist</li>
        </ul>
      </div>
    </div>
  );
}
