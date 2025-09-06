import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type MetricType = 'page_load' | 'query_time' | 'api_response' | 'error_rate';

export function usePerformance() {
  const { organizationId } = useAuth();

  const recordMetric = async (
    metric_type: MetricType,
    metric_name: string,
    value: number,
    unit: 'ms' | 'seconds' | 'percentage' | 'count',
    metadata?: Record<string, any>
  ) => {
    try {
      await supabase.from('performance_metrics').insert({
        metric_type,
        metric_name,
        value,
        unit,
        organization_id: organizationId || null,
        metadata: metadata || {}
      });
    } catch (err) {
      // Swallow errors to avoid impacting UX
      console.warn('Falha ao registrar métrica de performance:', err);
    }
  };

  return { recordMetric };
}
