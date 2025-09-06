import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/KpiCard';
import { Building2, Users, Calendar, Activity } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Visão geral de todas as organizações e atividades da plataforma
        </p>
      </div>

      {/* KPIs Globais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Organizações Ativas"
          value="12"
          icon={<Building2 className="w-4 h-4" />}
          trend={{ value: 8.2, label: "vs mês anterior" }}
        />
        <KpiCard
          title="Total de Usuários"
          value="347"
          icon={<Users className="w-4 h-4" />}
          trend={{ value: 12.5, label: "vs mês anterior" }}
        />
        <KpiCard
          title="Eventos Ativos"
          value="28"
          icon={<Calendar className="w-4 h-4" />}
          trend={{ value: -4.1, label: "vs mês anterior" }}
        />
        <KpiCard
          title="Check-ins Hoje"
          value="1,234"
          icon={<Activity className="w-4 h-4" />}
          trend={{ value: 15.3, label: "vs ontem" }}
        />
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Organizações Recentes</CardTitle>
            <CardDescription>
              Últimas organizações cadastradas na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Tech Corp</p>
                  <p className="text-sm text-muted-foreground">3 eventos ativos</p>
                </div>
                <span className="text-xs text-muted-foreground">2 dias atrás</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Marketing Plus</p>
                  <p className="text-sm text-muted-foreground">1 evento ativo</p>
                </div>
                <span className="text-xs text-muted-foreground">5 dias atrás</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade do Sistema</CardTitle>
            <CardDescription>
              Últimas atividades importantes da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Nova organização cadastrada</p>
                  <p className="text-xs text-muted-foreground">Tech Corp - 2 dias atrás</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Evento finalizado com sucesso</p>
                  <p className="text-xs text-muted-foreground">Conferência 2024 - 3 dias atrás</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}