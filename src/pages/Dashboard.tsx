import { useEffect, useState } from 'react';
import { KpiCard } from '@/components/ui/KpiCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/store/useAppStore';
import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// 👇 Importa o service de participantes
import participantesApi from '@/services/participantesService';

export default function Dashboard() {
  const {
    estatisticasHoje,
    ultimosCheckins,
    entradasPorMinuto
  } = useAppStore();

  const stats = estatisticasHoje('1');
  const checkins = ultimosCheckins(10);
  const chartData = entradasPorMinuto();

  // 👇 Novo estado para participantes
  const [participantesTotal, setParticipantesTotal] = useState<number | null>(null);

  // 👇 Fetch de participantes ao montar
  useEffect(() => {
    const fetchParticipantes = async () => {
      try {
        const data = await participantesApi.getContagemParticipantes();
        setParticipantesTotal(data); // A resposta já é o número total de participantes
      } catch (error) {
        console.error('Erro ao buscar contagem de participantes:', error);
      }
    };

    fetchParticipantes();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Visão geral do credenciamento em tempo real
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Entradas Hoje"
          value={stats.entradasHoje}
          description="Total de check-ins realizados"
          icon={<UserCheck />}
          trend={{ value: 12, label: 'vs ontem' }}
        />
        <KpiCard
          title="Último Minuto"
          value={stats.checkinsUltimoMinuto}
          description="Check-ins no último minuto"
          icon={<Clock />}
        />
        <KpiCard
          title="Participantes"
          value={participantesTotal ?? '...'} // Agora mostra o total de participantes
          description="Total cadastrados"
          icon={<Users />}
        />
        <KpiCard
          title="Pendentes"
          value={stats.pendentes}
          description="Aguardando check-in"
          icon={<AlertTriangle />}
          className="border-warning/20"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Entradas por Minuto (Hoje)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
                  <Line
                    type="monotone"
                    dataKey="entradas"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checkins.map((checkin) => (
                <div
                  key={checkin.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{checkin.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {checkin.metodo}
                    </p>
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
    </div>
  );
}
