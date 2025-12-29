// Comprehensive caching solution for the entire application

// Cache configuration
export const CACHE_CONFIG = {
  // Documents cache - very aggressive for dashboard
  documents: {
    staleTime: 1000 * 60, // 1 minute
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 0, // No auto-refresh for documents
    dedupingInterval: 0, // No deduping for documents
    errorRetryCount: 1,
    errorRetryInterval: 2000,
    suspense: false,
    keepPreviousData: true,
  },
  
  // User profile cache - very stable
  user: {
    staleTime: 1000 * 60 * 30, // 30 minutes
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 0,
    dedupingInterval: 0,
    errorRetryCount: 1,
    errorRetryInterval: 2000,
    suspense: false,
    keepPreviousData: true,
  },
  
  // Faculty dashboard cache - moderate refresh
  faculty: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 0,
    dedupingInterval: 0,
    errorRetryCount: 1,
    errorRetryInterval: 2000,
    suspense: false,
    keepPreviousData: true,
  },
  
  // Verification cache - very stable
  verification: {
    staleTime: 1000 * 60 * 15, // 15 minutes
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 0,
    dedupingInterval: 0,
    errorRetryCount: 1,
    errorRetryInterval: 2000,
    suspense: false,
    keepPreviousData: true,
  },
} as const;

// Cache keys
export const CACHE_KEYS = {
  documents: (userId: string) => `documents-${userId}`,
  user: (userId: string) => `user-${userId}`,
  faculty: () => 'faculty-dashboard',
  verification: () => 'verification-status',
} as const;

// Optimized fetchers
export const createOptimizedFetcher = <T extends any>(
  key: string,
  fetcher: (key: string, ...args: any[]) => Promise<T>
) => {
  return async (key: string, ...args: any[]) => {
    try {
      // Add cache-busting timestamp to prevent stale data
      const cacheKey = `${key}-${Date.now()}`;
      
      // Check if we have fresh data in cache
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        // Return cached data if it's still fresh
        if (age < CACHE_CONFIG.documents.staleTime) {
          console.log(`Cache hit for ${key}:`, { age, timestamp });
          return data as T;
        }
      }
      
      // Fetch fresh data
      console.log(`Cache miss for ${key}: fetching fresh data`);
      const result = await fetcher(key, ...args);
      
      // Cache the result
      localStorage.setItem(cacheKey, JSON.stringify({
        data: result,
        timestamp: Date.now(),
      }));
      
      return result;
    } catch (error) {
      console.error(`Fetch error for ${key}:`, error);
      throw error;
    }
  };
};
