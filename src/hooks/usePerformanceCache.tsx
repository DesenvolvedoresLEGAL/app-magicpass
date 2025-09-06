import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CacheConfig {
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold?: number;
}

export function usePerformanceCache<T>(
  queryKey: (string | number)[],
  queryFn: () => Promise<T>,
  config: CacheConfig = {}
) {
  const queryClient = useQueryClient();
  const startTime = useRef<number>();
  
  const {
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus = false
  } = config;

  // Start performance tracking
  useEffect(() => {
    startTime.current = performance.now();
  }, []);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const start = performance.now();
      try {
        const result = await queryFn();
        const duration = performance.now() - start;
        
        // Log performance metric
        logPerformanceMetric('query_time', queryKey.join('_'), duration, 'ms');
        
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        logPerformanceMetric('query_error', queryKey.join('_'), duration, 'ms');
        throw error;
      }
    },
    staleTime,
    gcTime: cacheTime,
    refetchOnWindowFocus,
    retry: (failureCount) => {
      // Log retry attempts
      logPerformanceMetric('query_retry', queryKey.join('_'), failureCount, 'count');
      return failureCount < 2;
    }
  });

  const invalidateCache = useCallback(async (reason = 'manual') => {
    await queryClient.invalidateQueries({ queryKey });
    
    // Log cache invalidation
    try {
      await supabase.functions.invoke('cache-invalidation', {
        body: {
          cacheKey: queryKey.join('_'),
          reason,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.warn('Failed to log cache invalidation:', error);
    }
  }, [queryKey, queryClient]);

  const prefetchData = useCallback(async () => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime
    });
  }, [queryKey, queryFn, staleTime, queryClient]);

  return {
    ...query,
    invalidateCache,
    prefetchData,
    isCached: query.isSuccess && !query.isStale,
    cacheAge: query.dataUpdatedAt ? Date.now() - query.dataUpdatedAt : null
  };
}

export function useOptimizedEvents(organizationId?: string) {
  return usePerformanceCache(
    ['events', organizationId],
    async () => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase
        .from('event_summary')
        .select('*')
        .eq('organization_id', organizationId)
        .order('start_date', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes for events
      cacheTime: 60 * 60 * 1000  // 1 hour
    }
  );
}

export function useOptimizedParticipants(
  eventId?: string,
  searchTerm = '',
  status?: string,
  page = 0,
  pageSize = 50
) {
  return usePerformanceCache(
    ['participants', eventId, searchTerm, status, page, pageSize],
    async () => {
      if (!eventId) return { data: [], totalCount: 0 };
      
      const { data, error } = await supabase.rpc('search_participants', {
        p_event_id: eventId,
        p_search_term: searchTerm,
        p_status: status,
        p_limit: pageSize,
        p_offset: page * pageSize
      });
      
      if (error) throw error;
      
      const totalCount = data?.[0]?.total_count || 0;
      return {
        data: data || [],
        totalCount: Number(totalCount),
        hasNextPage: (page + 1) * pageSize < totalCount,
        hasPreviousPage: page > 0
      };
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes for participant data
      cacheTime: 10 * 60 * 1000  // 10 minutes
    }
  );
}

export function useEventStatsCache(eventId?: string) {
  return usePerformanceCache(
    ['event-stats', eventId],
    async () => {
      if (!eventId) return null;
      
      const { data, error } = await supabase.rpc('get_event_stats_cached', {
        p_event_id: eventId
      });
      
      if (error) throw error;
      return data?.[0] || null;
    },
    {
      staleTime: 5 * 60 * 1000,  // 5 minutes for stats
      cacheTime: 15 * 60 * 1000  // 15 minutes
    }
  );
}

// Performance monitoring utilities
function logPerformanceMetric(
  type: string, 
  name: string, 
  value: number, 
  unit: string,
  metadata: Record<string, any> = {}
) {
  // Only log in production or when debugging
  if (import.meta.env.DEV && !import.meta.env.VITE_DEBUG_PERFORMANCE) {
    return;
  }
  
  // Log to console for development
  console.log(`[Performance] ${type}:${name} = ${value}${unit}`, metadata);
  
  // Send to analytics in production
  if (import.meta.env.PROD) {
    supabase.functions.invoke('log-performance', {
      body: {
        metric_type: type,
        metric_name: name,
        value,
        unit,
        metadata
      }
    }).catch(error => {
      console.warn('Failed to log performance metric:', error);
    });
  }
}

export function usePerformanceMonitor() {
  const metrics = useRef<PerformanceMetric[]>([]);
  
  const addMetric = useCallback((metric: PerformanceMetric) => {
    metrics.current.push(metric);
    logPerformanceMetric('custom', metric.name, metric.value, metric.unit);
    
    // Check thresholds
    if (metric.threshold && metric.value > metric.threshold) {
      console.warn(`Performance threshold exceeded: ${metric.name} = ${metric.value}${metric.unit} (threshold: ${metric.threshold}${metric.unit})`);
    }
  }, []);
  
  const measurePageLoad = useCallback(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        addMetric({
          name: 'page_load_time',
          value: navigation.loadEventEnd - navigation.fetchStart,
          unit: 'ms',
          threshold: 3000
        });
        
        addMetric({
          name: 'dom_content_loaded',
          value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          unit: 'ms',
          threshold: 1500
        });
      }
    }
  }, [addMetric]);
  
  const measureRender = useCallback((componentName: string, renderTime: number) => {
    addMetric({
      name: `render_${componentName}`,
      value: renderTime,
      unit: 'ms',
      threshold: 100
    });
  }, [addMetric]);
  
  return {
    addMetric,
    measurePageLoad,
    measureRender,
    getMetrics: () => metrics.current
  };
}

// Cache invalidation hook
export function useCacheInvalidation() {
  const queryClient = useQueryClient();
  
  const invalidateByPattern = useCallback(async (pattern: string, reason = 'pattern_match') => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.findAll();
    
    for (const query of queries) {
      const queryKey = query.queryKey.join('_');
      if (queryKey.includes(pattern)) {
        await queryClient.invalidateQueries({ queryKey: query.queryKey });
        
        // Log invalidation
        try {
          await supabase.functions.invoke('cache-invalidation', {
            body: {
              cacheKey: queryKey,
              reason: `${reason}: ${pattern}`,
              timestamp: new Date().toISOString()
            }
          });
        } catch (error) {
          console.warn('Failed to log cache invalidation:', error);
        }
      }
    }
  }, [queryClient]);
  
  const invalidateEventData = useCallback(async (eventId: string) => {
    await invalidateByPattern(eventId, 'event_updated');
  }, [invalidateByPattern]);
  
  const invalidateOrgData = useCallback(async (organizationId: string) => {
    await invalidateByPattern(organizationId, 'organization_updated');
  }, [invalidateByPattern]);
  
  return {
    invalidateByPattern,
    invalidateEventData,
    invalidateOrgData
  };
}