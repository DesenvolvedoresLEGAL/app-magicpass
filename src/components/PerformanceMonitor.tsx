import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, AlertTriangle, CheckCircle, Clock, 
  Database, Globe, Smartphone, TrendingUp, Zap 
} from 'lucide-react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceCache';
import { supabase } from '@/integrations/supabase/client';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  threshold: number;
  description: string;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export function PerformanceMonitor() {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addMetric, measurePageLoad, getMetrics } = usePerformanceMonitor();

  const checkSystemHealth = useCallback(async () => {
    setIsLoading(true);
    try {
      const startTime = performance.now();
      
      // Test database connection
      const dbStart = performance.now();
      const { error: dbError } = await supabase.from('events').select('count').limit(1);
      const dbTime = performance.now() - dbStart;
      
      // Test API response time
      const apiStart = performance.now();
      const { error: apiError } = await supabase.functions.invoke('analytics-summary', {
        body: { organizationId: 'test', period: '7d' }
      });
      const apiTime = performance.now() - apiStart;
      
      // Memory usage (if available)
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100 : 0;
      
      // Network connection
      const connection = (navigator as any).connection;
      const networkSpeed = connection ? connection.downlink : 0;
      
      const newMetrics: SystemMetric[] = [
        {
          name: 'Database Response',
          value: dbTime,
          unit: 'ms',
          status: dbTime < 100 ? 'good' : dbTime < 500 ? 'warning' : 'critical',
          threshold: 500,
          description: 'Time to execute database queries'
        },
        {
          name: 'API Response',
          value: apiTime,
          unit: 'ms', 
          status: apiTime < 1000 ? 'good' : apiTime < 3000 ? 'warning' : 'critical',
          threshold: 3000,
          description: 'Edge function response time'
        },
        {
          name: 'Memory Usage',
          value: memoryUsage,
          unit: '%',
          status: memoryUsage < 70 ? 'good' : memoryUsage < 90 ? 'warning' : 'critical',
          threshold: 90,
          description: 'JavaScript heap memory usage'
        },
        {
          name: 'Network Speed',
          value: networkSpeed,
          unit: 'Mbps',
          status: networkSpeed > 10 ? 'good' : networkSpeed > 1 ? 'warning' : 'critical',
          threshold: 1,
          description: 'Estimated connection speed'
        }
      ];
      
      setMetrics(newMetrics);
      
      // Generate alerts for critical metrics
      const newAlerts: PerformanceAlert[] = [];
      newMetrics.forEach(metric => {
        if (metric.status === 'critical') {
          newAlerts.push({
            id: `${metric.name}-${Date.now()}`,
            type: 'error',
            message: `${metric.name} is critical: ${metric.value}${metric.unit}`,
            timestamp: new Date(),
            resolved: false
          });
        } else if (metric.status === 'warning') {
          newAlerts.push({
            id: `${metric.name}-${Date.now()}`,
            type: 'warning',
            message: `${metric.name} is slow: ${metric.value}${metric.unit}`,
            timestamp: new Date(),
            resolved: false
          });
        }
      });
      
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 10)]);
      
      const totalTime = performance.now() - startTime;
      addMetric({
        name: 'health_check_time',
        value: totalTime,
        unit: 'ms',
        threshold: 5000
      });
      
    } catch (error) {
      console.error('Health check failed:', error);
      setAlerts(prev => [{
        id: `error-${Date.now()}`,
        type: 'error',
        message: 'System health check failed',
        timestamp: new Date(),
        resolved: false
      }, ...prev.slice(0, 10)]);
    } finally {
      setIsLoading(false);
    }
  }, [addMetric]);

  useEffect(() => {
    measurePageLoad();
    checkSystemHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, [measurePageLoad, checkSystemHealth]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  if (!isOpen) {
    const criticalCount = metrics.filter(m => m.status === 'critical').length;
    const warningCount = metrics.filter(m => m.status === 'warning').length;
    
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className={`relative ${criticalCount > 0 ? 'border-red-500 text-red-600' : warningCount > 0 ? 'border-yellow-500 text-yellow-600' : 'border-green-500 text-green-600'}`}
        >
          <Activity className="w-4 h-4 mr-2" />
          System Health
          {(criticalCount > 0 || warningCount > 0) && (
            <Badge 
              variant={criticalCount > 0 ? "destructive" : "secondary"}
              className="ml-2 text-xs"
            >
              {criticalCount + warningCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Monitor
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={checkSystemHealth}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? <Clock className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Refresh
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              size="sm"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
          {/* System Metrics */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">System Metrics</h4>
            {metrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(metric.status)}
                    <span className="text-sm font-medium">{metric.name}</span>
                  </div>
                  <span className={`text-sm font-mono ${getStatusColor(metric.status)}`}>
                    {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}{metric.unit}
                  </span>
                </div>
                <Progress 
                  value={metric.unit === '%' ? metric.value : Math.min((metric.value / metric.threshold) * 100, 100)}
                  className={`h-2 ${metric.status === 'critical' ? 'bg-red-100' : metric.status === 'warning' ? 'bg-yellow-100' : 'bg-green-100'}`}
                />
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            ))}
          </div>
          
          {/* Performance Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Recent Alerts</h4>
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border text-sm ${
                    alert.resolved 
                      ? 'bg-gray-50 border-gray-200 opacity-60' 
                      : alert.type === 'error' 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={alert.resolved ? 'line-through' : ''}>{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {!alert.resolved && (
                      <Button
                        onClick={() => resolveAlert(alert.id)}
                        variant="ghost"
                        size="sm"
                        className="text-xs px-2 py-1 h-auto"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Performance Tips */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Optimization Tips</h4>
            <div className="text-xs space-y-1 text-muted-foreground">
              <p>• Cache is active for frequently accessed data</p>
              <p>• Database queries are optimized with indexes</p>
              <p>• Page loads are monitored automatically</p>
              <p>• Alerts fire when thresholds are exceeded</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}