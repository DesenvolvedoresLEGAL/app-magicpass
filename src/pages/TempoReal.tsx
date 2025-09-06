import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/KpiCard';
import { useAppStore } from '@/store/useAppStore';
import { Activity, TrendingUp, Users, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function TempoReal() {
  const { entradasPorMinuto, ultimosCheckins, estatisticasHoje } = useAppStore();
  const [liveStats, setLiveStats] = useState({
    totalEntradas: 0,
    entradasUltimoMinuto: 0,
    taxa: 0
  });
  const [isLive, setIsLive] = useState(true);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const stats = estatisticasHoje('1');
      const randomIncrease = Math.random() > 0.7 ? 1 : 0; // 30% chance of new entry
      
      setLiveStats(prev => ({
        totalEntradas: stats.entradasHoje + randomIncrease,
        entradasUltimoMinuto: Math.floor(Math.random() * 5),
        taxa: Math.floor(Math.random() * 20) + 10 // 10-30 entries per minute
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const chartData = entradasPorMinuto();
  const recentCheckins = ultimosCheckins(10);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="w-8 h-8 text-primary" />
            Tempo Real
          </h1>
          <p className="text-muted-foreground">
            Monitoramento ao vivo do credenciamento
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm text-success font-medium">AO VIVO</span>
          </div>
        </div>
      </div>

      {/* Live KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard
          title="Total de Entradas"
          value={liveStats.totalEntradas}
          description="Desde o início do evento"
          icon={<Users />}
          className="border-primary/20 bg-primary/5"
        />
        <KpiCard
          title="Último Minuto"
          value={liveStats.entradasUltimoMinuto}
          description="Check-ins recentes"
          icon={<Clock />}
          className="border-accent/20 bg-accent/5"
        />
        <KpiCard
          title="Taxa Atual"
          value={`${liveStats.taxa}/min`}
          description="Entradas por minuto"
          icon={<TrendingUp />}
          className="border-secondary/20 bg-secondary/5"
        />
        <KpiCard
          title="Pico do Dia"
          value="45/min"
          description="Maior fluxo registrado"
          icon={<Activity />}
          trend={{ value: 12, label: 'vs. ontem' }}
        />
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Entradas por Minuto - Últimos 15min
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="minuto" 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="entradas" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade em Tempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentCheckins.map((checkin, index) => (
                <div 
                  key={checkin.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all duration-500 ${
                    index === 0 ? 'bg-primary/10 border border-primary/20 slide-up' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-primary animate-pulse' : 'bg-muted-foreground'
                    }`}></div>
                    <div>
                      <p className="font-medium">{checkin.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        via {checkin.metodo}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {checkin.hora}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Métodos de Check-in</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">QR Code</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-primary rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">75%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Facial</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-1/5 h-full bg-secondary rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">20%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Manual</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-1/20 h-full bg-accent rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Scanner QR</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm text-success">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Reconhecimento Facial</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span className="text-sm text-warning">Manutenção</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Base de Dados</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm text-success">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Webhooks</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm text-success">Funcionando</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Marcos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-2xl font-bold text-primary">95</p>
                <p className="text-sm text-muted-foreground">para 100 entradas</p>
              </div>
              <div className="text-center p-3 bg-secondary/5 rounded-lg border border-secondary/20">
                <p className="text-2xl font-bold text-secondary">255</p>
                <p className="text-sm text-muted-foreground">para 50% da capacidade</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}