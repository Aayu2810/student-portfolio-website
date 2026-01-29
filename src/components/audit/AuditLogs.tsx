'use client'

import { useState, useEffect } from 'react'
import { useAuditLogs } from '../../hooks/useAuditLogs'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'

export function AuditLogs() {
  const { logs, loading } = useAuditLogs(50)
  const [filter, setFilter] = useState('all')

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true
    return log.action === filter
  })

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800'
      case 'update':
        return 'bg-blue-100 text-blue-800'
      case 'delete':
        return 'bg-red-100 text-red-800'
      case 'approve':
        return 'bg-purple-100 text-purple-800'
      case 'verify':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Real-time Audit Logs</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="approve">Approve</option>
          <option value="verify">Verify</option>
        </select>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No audit logs found
          </div>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={getActionColor(log.action)}>
                    {log.action.toUpperCase()}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm">
                      {log.resource_type}: {log.resource_id}
                    </p>
                    <p className="text-xs text-gray-500">
                      {log.user_email} • {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {log.details && (
                  <div className="text-xs text-gray-400 max-w-xs truncate">
                    {JSON.stringify(log.details)}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
