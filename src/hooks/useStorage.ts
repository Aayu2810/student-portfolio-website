'use client'

import { useEffect, useState } from 'react'
import { useUser } from './useUser'
import { createClient } from '../lib/supabase/client'

interface StorageInfo {
  used: number
  total: number
  percentage: number
}

export function useStorage(): StorageInfo {
  const { user } = useUser()
  const [storage, setStorage] = useState<StorageInfo>({
    used: 0,
    total: 5 * 1024 * 1024 * 1024, // 5GB default
    percentage: 0,
  })

  useEffect(() => {
    const fetchStorage = async () => {
      if (!user) return

      const supabase = createClient()
      
      // Get user's documents
      const { data: documents } = await supabase
        .from('documents')
        .select('file_size')
        .eq('user_id', user.id)

      if (documents) {
        const totalUsed = documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0)
        const percentage = (totalUsed / storage.total) * 100

        setStorage({
          used: totalUsed,
          total: storage.total,
          percentage,
        })
      }
    }

    fetchStorage()
  }, [user])

  return storage
}
