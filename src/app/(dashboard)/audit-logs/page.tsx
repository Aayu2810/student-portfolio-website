'use client';

import { ActivityTimeline } from '@/components/audit/ActivityTimeline';
import { Shield, Activity, Clock, Users } from 'lucide-react';

export default function AuditLogsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-400" />
            Audit Logs
          </h1>
          <p className="text-gray-400 text-lg">
            Real-time monitoring of all document activities and security events
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-medium text-white">Total Activities</h3>
            </div>
            <p className="text-3xl font-bold text-purple-400">247</p>
            <p className="text-sm text-gray-400 mt-1">Last 30 days</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-medium text-white">Recent Views</h3>
            </div>
            <p className="text-3xl font-bold text-blue-400">89</p>
            <p className="text-sm text-gray-400 mt-1">Last 7 days</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-medium text-white">Verifications</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-400">34</p>
            <p className="text-sm text-gray-400 mt-1">This month</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-medium text-white">Active Users</h3>
            </div>
            <p className="text-3xl font-bold text-cyan-400">12</p>
            <p className="text-sm text-gray-400 mt-1">Today</p>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-semibold text-white">Activity Timeline</h2>
            <div className="text-sm text-gray-400">Live</div>
          </div>
          
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
}
