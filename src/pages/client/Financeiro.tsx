import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KpiCard } from '@/components/ui/KpiCard';
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar, 
  FileText, Download, Filter, CreditCard, Receipt,
  PlusCircle, Eye, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transaction {
  id: string;
  event_name: string;
  participant_name: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  created_at: string;
  stripe_session_id?: string;
}

interface Invoice {
  id: string;
  event_name: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  due_date: string;
  created_at: string;
  participant_count: number;
}

export function Financeiro() {
  const { organizationId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState({
    period: '30',
    status: 'all',
    search: ''
  });

  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingAmount: 0,
    transactionCount: 0,
    averageTicket: 0,
    growthRate: 0
  });

  useEffect(() => {
    if (organizationId) {
      loadFinancialData();
    }
  }, [organizationId, filter]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      // Load financial data - mock data for now
      // In real implementation, this would query your financial tables
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          event_name: 'Conferência Tech 2024',
          participant_name: 'João Silva',
          amount: 29900, // R$ 299,00 in cents
          currency: 'BRL',
          status: 'paid',
          payment_method: 'credit_card',
          created_at: '2024-01-15T10:30:00Z',
          stripe_session_id: 'cs_test_123'
        },
        {
          id: '2',
          event_name: 'Workshop React',
          participant_name: 'Maria Santos',
          amount: 19900,
          currency: 'BRL',
          status: 'pending',
          payment_method: 'pix',
          created_at: '2024-01-14T15:20:00Z'
        },
        {
          id: '3',
          event_name: 'Meetup DevOps',
          participant_name: 'Pedro Costa',
          amount: 9900,
          currency: 'BRL',
          status: 'failed',
          payment_method: 'credit_card',
          created_at: '2024-01-13T09:15:00Z'
        }
      ];

      const mockInvoices: Invoice[] = [
        {
          id: '1',
          event_name: 'Conferência Tech 2024',
          amount: 1500000, // R$ 15.000,00
          tax_amount: 150000, // R$ 1.500,00
          total_amount: 1650000,
          status: 'paid',
          due_date: '2024-02-15',
          created_at: '2024-01-15T00:00:00Z',
          participant_count: 50
        },
        {
          id: '2',
          event_name: 'Workshop React',
          amount: 800000,
          tax_amount: 80000,
          total_amount: 880000,
          status: 'sent',
          due_date: '2024-02-20',
          created_at: '2024-01-20T00:00:00Z',
          participant_count: 40
        }
      ];

      setTransactions(mockTransactions);
      setInvoices(mockInvoices);

      // Calculate KPIs
      const totalRevenue = mockTransactions
        .filter(t => t.status === 'paid')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const pendingAmount = mockTransactions
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);

      setKpis({
        totalRevenue,
        monthlyRevenue: totalRevenue,
        pendingAmount,
        transactionCount: mockTransactions.length,
        averageTicket: totalRevenue / mockTransactions.filter(t => t.status === 'paid').length || 0,
        growthRate: 15.3
      });

    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: 'Pago', variant: 'default' as const },
      pending: { label: 'Pendente', variant: 'secondary' as const },
      failed: { label: 'Falhou', variant: 'destructive' as const },
      refunded: { label: 'Reembolsado', variant: 'outline' as const },
      draft: { label: 'Rascunho', variant: 'outline' as const },
      sent: { label: 'Enviado', variant: 'secondary' as const },
      overdue: { label: 'Vencido', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão Financeira</h1>
          <p className="text-muted-foreground">
            Controle de receitas, pagamentos e faturamento
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Nova Fatura
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Receita Total"
          value={formatCurrency(kpis.totalRevenue)}
          icon={<DollarSign className="w-4 h-4" />}
          trend={{ value: kpis.growthRate, label: "vs mês anterior" }}
        />
        <KpiCard
          title="Receita Mensal"
          value={formatCurrency(kpis.monthlyRevenue)}
          icon={<TrendingUp className="w-4 h-4" />}
          description="Janeiro 2024"
        />
        <KpiCard
          title="Valores Pendentes"
          value={formatCurrency(kpis.pendingAmount)}
          icon={<AlertCircle className="w-4 h-4" />}
          description={`${transactions.filter(t => t.status === 'pending').length} transações`}
        />
        <KpiCard
          title="Ticket Médio"
          value={formatCurrency(kpis.averageTicket)}
          icon={<Receipt className="w-4 h-4" />}
          description={`${kpis.transactionCount} transações`}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="period">Período</Label>
              <Select value={filter.period} onValueChange={(value) => setFilter(prev => ({ ...prev, period: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 3 meses</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filter.status} onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pagos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="failed">Falharam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Buscar por evento ou participante..."
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Transações
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Faturas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Participante</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">{transaction.event_name}</TableCell>
                      <TableCell>{transaction.participant_name}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell className="capitalize">
                        {transaction.payment_method.replace('_', ' ')}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Faturas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Participantes</TableHead>
                    <TableHead>Valor Base</TableHead>
                    <TableHead>Impostos</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        {format(new Date(invoice.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">{invoice.event_name}</TableCell>
                      <TableCell>{invoice.participant_count}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(invoice.tax_amount)}</TableCell>
                      <TableCell className="font-mono font-bold">{formatCurrency(invoice.total_amount)}</TableCell>
                      <TableCell>
                        {format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}