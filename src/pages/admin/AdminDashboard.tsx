import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Calendar, Activity, TrendingUp, TrendingDown } from 'lucide-react';

type DashboardStats = {
  organizations: number;
  users: number;
  events: number;
  checkins: number;
  recentOrganizations: Array<{
    id: string;
    name: string;
    created_at: string;
    _count: { events: number };
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    created_at: string;
  }>;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    organizations: 0,
    users: 0,
    events: 0,
    checkins: 0,
    recentOrganizations: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch organizations count
      const { count: orgCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });

      // Fetch users count
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch events count
      const { count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      // Fetch participants count for today's checkins
      const today = new Date().toISOString().split('T')[0];
      const { count: checkinCount } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .not('checked_in_at', 'is', null)
        .gte('checked_in_at', today);

      // Fetch recent organizations
      const { data: recentOrgs } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          created_at,
          events(count)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Transform recent organizations data
      const transformedRecentOrgs = recentOrgs?.map(org => ({
        ...org,
        _count: { events: org.events?.length || 0 }
      })) || [];

      // Create mock recent activity (in a real app, this would come from an activity log table)
      const mockActivity = [
        {
          id: '1',
          type: 'organization_created',
          description: `Nova organização cadastrada: ${recentOrgs?.[0]?.name || 'N/A'}`,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'event_completed',
          description: 'Evento finalizado com sucesso',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'user_signup',
          description: 'Novos usuários cadastrados no sistema',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setStats({
        organizations: orgCount || 0,
        users: userCount || 0,
        events: eventCount || 0,
        checkins: checkinCount || 0,
        recentOrganizations: transformedRecentOrgs,
        recentActivity: mockActivity
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'organization_created':
        return <div className="w-2 h-2 bg-success rounded-full"></div>;
      case 'event_completed':
        return <div className="w-2 h-2 bg-primary rounded-full"></div>;
      case 'user_signup':
        return <div className="w-2 h-2 bg-warning rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hoje';
    if (diffInDays === 1) return 'Ontem';
    return `${diffInDays} dias atrás`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

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
          value={stats.organizations.toString()}
          icon={<Building2 className="w-4 h-4" />}
          trend={{ value: 8.2, label: "vs mês anterior" }}
        />
        <KpiCard
          title="Total de Usuários"
          value={stats.users.toString()}
          icon={<Users className="w-4 h-4" />}
          trend={{ value: 12.5, label: "vs mês anterior" }}
        />
        <KpiCard
          title="Eventos Ativos"
          value={stats.events.toString()}
          icon={<Calendar className="w-4 h-4" />}
          trend={{ value: -4.1, label: "vs mês anterior" }}
        />
        <KpiCard
          title="Check-ins Hoje"
          value={stats.checkins.toString()}
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
              {stats.recentOrganizations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma organização cadastrada ainda
                </p>
              ) : (
                stats.recentOrganizations.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {org._count.events} evento{org._count.events !== 1 ? 's' : ''} ativo{org._count.events !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(org.created_at)}
                    </span>
                  </div>
                ))
              )}
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
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.created_at)}
                    </p>
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