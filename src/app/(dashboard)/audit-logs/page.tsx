'use client';

export default function AuditLogsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Audit Logs</h1>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Audit Logs Dashboard</h2>
          <p className="text-gray-400 mb-6">Track all document access and user activities</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Total Activities</h3>
              <p className="text-3xl font-bold text-purple-400">142</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Downloads</h3>
              <p className="text-3xl font-bold text-blue-400">24</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Shares</h3>
              <p className="text-3xl font-bold text-green-400">18</p>
            </div>
          </div>
          
          <div className="mt-8 text-gray-500">
            <p>Audit logs functionality will be implemented in a future update.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
