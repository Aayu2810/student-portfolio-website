// Comprehensive caching solution for the entire application

// Cache configuration - optimized for performance
export const CACHE_CONFIG = {
  // Documents cache - ultra-fast with smart invalidation
  documents: {
    staleTime: 1000 * 60 * 2, // 2 minutes - balance between freshness and speed
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 0,
    dedupingInterval: 1000, // 1 second deduping to prevent duplicate requests
    errorRetryCount: 2,
    errorRetryInterval: 1000,
    suspense: false,
    keepPreviousData: true,
  },
  
  // User profile cache - very stable
  user: {
    staleTime: 1000 * 60 * 30, // 30 minutes
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 0,
    dedupingInterval: 5000, // 5 seconds
    errorRetryCount: 1,
    errorRetryInterval: 2000,
    suspense: false,
    keepPreviousData: true,
  },
  
  // Faculty dashboard cache - moderate refresh for real-time updates
  faculty: {
    staleTime: 1000 * 60 * 3, // 3 minutes - more frequent for faculty
    revalidateOnFocus: true, // Refresh when window gains focus
    revalidateOnReconnect: true,
    refreshInterval: 1000 * 60 * 2, // Auto-refresh every 2 minutes
    dedupingInterval: 2000, // 2 seconds
    errorRetryCount: 3,
    errorRetryInterval: 1500,
    suspense: false,
    keepPreviousData: true,
  },
  
  // Verification cache - moderate for verification status
  verification: {
    staleTime: 1000 * 60 * 10, // 10 minutes
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
    dedupingInterval: 3000, // 3 seconds
    errorRetryCount: 2,
    errorRetryInterval: 2000,
    suspense: false,
    keepPreviousData: true,
  },
  
  // Locker cache - fast for document access
  locker: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 0,
    dedupingInterval: 1500, // 1.5 seconds
    errorRetryCount: 2,
    errorRetryInterval: 1000,
    suspense: false,
    keepPreviousData: true,
  },
  
  // Dashboard stats cache - very fast for metrics
  stats: {
    staleTime: 1000 * 30, // 30 seconds - stats change frequently
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 1000 * 60, // Auto-refresh every minute
    dedupingInterval: 500, // 0.5 seconds
    errorRetryCount: 3,
    errorRetryInterval: 500,
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
  locker: (userId: string) => `locker-${userId}`,
  stats: (userId: string) => `stats-${userId}`,
  verificationQueue: () => 'verification-queue',
  facultyStats: () => 'faculty-stats',
} as const;

// Cache invalidation utilities
export const invalidateCache = (pattern: string) => {
  if (typeof window === 'undefined') return;
  
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes(pattern)) {
      localStorage.removeItem(key);
    }
  });
};

export const clearUserCache = (userId: string) => {
  invalidateCache(userId);
};

export const clearAllCache = () => {
  if (typeof window === 'undefined') return;
  localStorage.clear();
};

// Optimized fetchers with intelligent caching
export const createOptimizedFetcher = <T extends any>(
  key: string,
  fetcher: (key: string, ...args: any[]) => Promise<T>,
  cacheConfig?: typeof CACHE_CONFIG.documents
) => {
  return async (fetchKey: string, ...args: any[]) => {
    try {
      const config = cacheConfig || CACHE_CONFIG.documents;
      const cacheKey = `${key}-${fetchKey}`;
      
      // Check localStorage cache first
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          
          // Return cached data if still fresh
          if (age < config.staleTime) {
            console.log(`Cache hit for ${cacheKey}:`, { age: Math.round(age / 1000) + 's' });
            return data as T;
          } else {
            // Remove stale cache
            localStorage.removeItem(cacheKey);
          }
        }
      }
      
      // Fetch fresh data
      console.log(`Cache miss for ${cacheKey}: fetching fresh data`);
      const result = await fetcher(fetchKey, ...args);
      
      // Cache the result
      if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify({
          data: result,
          timestamp: Date.now(),
        }));
      }
      
      return result;
    } catch (error) {
      console.error(`Fetch error for ${key}:`, error);
      throw error;
    }
  };
};

// Memory cache for ultra-fast access
const memoryCache = new Map<string, { data: any; timestamp: number }>();

export const setMemoryCache = (key: string, data: any) => {
  memoryCache.set(key, { data, timestamp: Date.now() });
};

export const getMemoryCache = (key: string, staleTime: number) => {
  const cached = memoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < staleTime) {
    return cached.data;
  }
  memoryCache.delete(key);
  return null;
};

export const invalidateMemoryCache = (pattern?: string) => {
  if (pattern) {
    const keysToDelete: string[] = [];
    memoryCache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => memoryCache.delete(key));
  } else {
    memoryCache.clear();
  }
};
