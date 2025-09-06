import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KpiCard } from '@/components/ui/KpiCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList
} from 'recharts';
import { 
  TrendingUp, Users, Calendar, Target, Brain, Download,
  Clock, MapPin, Smartphone, Monitor, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  conversationFunnel: Array<{ name: string; value: number; color: string }>;
  eventComparison: Array<{ name: string; inscricoes: number; checkins: number; conversao: number }>;
  temporalTrends: Array<{ date: string; inscricoes: number; checkins: number }>;
  demographics: Array<{ name: string; value: number; color: string }>;
  deviceStats: Array<{ device: string; sessions: number; conversao: number }>;
  abandonment: Array<{ step: string; abandono: number }>;
}

export function Analytics() {
  const { organizationId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [data, setData] = useState<AnalyticsData | null>(null);

  const [insights, setInsights] = useState([
    {
      type: 'opportunity',
      title: 'Taxa de conversão baixa no Workshop React',
      description: 'Apenas 65% dos inscritos fizeram check-in. Considere enviar lembretes automáticos.',
      impact: 'Alto',
      action: 'Configurar notificações'
    },
    {
      type: 'success',
      title: 'Crescimento de 23% nas inscrições',
      description: 'Comparado ao mês anterior, houve um aumento significativo nas inscrições.',
      impact: 'Positivo',
      action: 'Manter estratégia'
    },
    {
      type: 'warning',
      title: 'Alto abandono no campo de telefone',
      description: '35% dos usuários abandonam o formulário no campo telefone.',
      impact: 'Médio',
      action: 'Tornar campo opcional'
    }
  ]);

  useEffect(() => {
    if (organizationId) {
      loadAnalyticsData();
    }
  }, [organizationId, selectedPeriod, selectedEvent]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const period = selectedPeriod;
      const eventId = selectedEvent !== 'all' ? selectedEvent : null;
      const { data: result, error } = await supabase.functions.invoke('analytics-summary', {
        body: { organizationId, period, eventId },
      });
      if (error) throw error;
      setData(result as AnalyticsData);
    } catch (e) {
      console.error('Erro ao carregar analytics:', e);
      // Fallback seguro para evitar tela em branco
      setData({
        conversationFunnel: [],
        eventComparison: [],
        temporalTrends: [],
        demographics: [],
        deviceStats: [],
        abandonment: []
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Implementation for exporting analytics report
    console.log('Exporting analytics report...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Avançado</h1>
          <p className="text-muted-foreground">
            Insights detalhados sobre performance e conversão
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 3 meses</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os eventos</SelectItem>
              <SelectItem value="1">Conferência Tech</SelectItem>
              <SelectItem value="2">Workshop React</SelectItem>
              <SelectItem value="3">Meetup DevOps</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Taxa de Conversão"
          value="83.4%"
          icon={<Target className="w-4 h-4" />}
          trend={{ value: 5.2, label: "vs período anterior" }}
        />
        <KpiCard
          title="Tempo Médio de Inscrição"
          value="3m 24s"
          icon={<Clock className="w-4 h-4" />}
          trend={{ value: -12.5, label: "vs período anterior" }}
        />
        <KpiCard
          title="Taxa de Abandono"
          value="16.6%"
          icon={<AlertTriangle className="w-4 h-4" />}
          description="No formulário de inscrição"
        />
        <KpiCard
          title="Score de Engajamento"
          value="8.7/10"
          icon={<Brain className="w-4 h-4" />}
          trend={{ value: 8.3, label: "vs período anterior" }}
        />
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Insights Automatizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-border space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={
                      insight.type === 'success' ? 'default' : 
                      insight.type === 'warning' ? 'secondary' : 'outline'
                    }
                  >
                    {insight.impact}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {insight.type === 'success' ? '✅' : insight.type === 'warning' ? '⚠️' : '💡'}
                  </span>
                </div>
                <h4 className="font-semibold text-sm">{insight.title}</h4>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
                <Button size="sm" variant="outline" className="w-full text-xs">
                  {insight.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="funnel">Funil</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="demographics">Demografia</TabsTrigger>
          <TabsTrigger value="behavior">Comportamento</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Funil de Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <FunnelChart>
                    <Tooltip />
                    <Funnel
                      dataKey="value"
                      data={data.conversationFunnel}
                      isAnimationActive
                    >
                      <LabelList position="center" fill="#fff" stroke="none" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Abandono por Etapa</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.abandonment}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="step" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="abandono" fill="hsl(var(--destructive))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparação entre Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.eventComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="inscricoes" fill="hsl(var(--primary))" name="Inscrições" />
                  <Bar dataKey="checkins" fill="hsl(var(--secondary))" name="Check-ins" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendências Temporais</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.temporalTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="inscricoes" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Inscrições"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="checkins" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Check-ins"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Perfil dos Participantes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.demographics}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.demographics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dispositivos Utilizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.deviceStats.map((device, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        {device.device === 'Desktop' ? (
                          <Monitor className="w-5 h-5" />
                        ) : (
                          <Smartphone className="w-5 h-5" />
                        )}
                        <div>
                          <p className="font-medium">{device.device}</p>
                          <p className="text-sm text-muted-foreground">
                            {device.sessions} sessões
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{device.conversao}%</p>
                        <p className="text-sm text-muted-foreground">conversão</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Tempo por Página
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Página inicial</span>
                    <span className="text-sm font-mono">1m 32s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Formulário</span>
                    <span className="text-sm font-mono">3m 24s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Confirmação</span>
                    <span className="text-sm font-mono">45s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Origem Geográfica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">São Paulo</span>
                    <span className="text-sm">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Rio de Janeiro</span>
                    <span className="text-sm">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Outros</span>
                    <span className="text-sm">30%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Horários de Pico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">09:00 - 11:00</span>
                    <span className="text-sm">35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">14:00 - 16:00</span>
                    <span className="text-sm">40%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">19:00 - 21:00</span>
                    <span className="text-sm">25%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}