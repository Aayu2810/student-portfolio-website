import { createClient } from './supabase/client'

export interface UserInfo {
  email: string
  first_name: string
  last_name: string
}

export async function getUserInfo(userIds: string[]): Promise<Map<string, UserInfo>> {
  const supabase = createClient()
  let userMap = new Map<string, UserInfo>()
  
  if (userIds.length === 0) return userMap
  
  // Try to get user info from profiles table first
  try {
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .in('id', userIds)
    
    if (!profileError && profiles) {
      userMap = new Map(
        profiles.map(profile => [
          profile.id,
          {
            email: profile.email || 'user@example.com',
            first_name: profile.first_name || '',
            last_name: profile.last_name || ''
          }
        ])
      )
    }
  } catch (profileError) {
    console.log('Could not access profiles table')
  }
  
  // If profiles didn't work, try to get from auth.users via RPC
  if (userMap.size === 0) {
    try {
      const { data: authUsers, error: authError } = await supabase
        .rpc('get_user_info', { user_ids: userIds })
      
      if (!authError && authUsers) {
        userMap = new Map(
          authUsers.map((user: any) => [
            user.id,
            {
              email: user.email || 'user@example.com',
              first_name: user.raw_user_meta_data?.first_name || user.email?.split('@')[0] || 'Student',
              last_name: user.raw_user_meta_data?.last_name || ''
            }
          ])
        )
      }
    } catch (authError) {
      console.log('Could not access auth.users, using fallback')
    }
  }
  
  return userMap
}

export function formatUserInfo(userInfo: UserInfo | undefined, userId: string): {
  displayName: string
  displayEmail: string
} {
  if (!userInfo) {
    return {
      displayName: `Student-${userId.slice(0, 6)}`,
      displayEmail: `student-${userId.slice(0, 6)}@campus.edu`
    }
  }
  
  const displayName = userInfo.first_name && userInfo.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}`.trim()
    : userInfo.first_name || `Student-${userId.slice(0, 6)}`
  
  const displayEmail = userInfo.email && userInfo.email !== 'user@example.com'
    ? userInfo.email
    : `student-${userId.slice(0, 6)}@campus.edu`
  
  return { displayName, displayEmail }
}
