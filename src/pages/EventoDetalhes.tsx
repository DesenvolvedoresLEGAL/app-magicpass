import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tag } from '@/components/ui/Tag';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppStore } from '@/store/useAppStore';
import { 
  ArrowLeft, 
  Edit, 
  Users, 
  Download, 
  Plus, 
  Search,
  Filter,
  QrCode
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function EventoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEventoById, getParticipantesByEvento, updateEvento, addParticipante } = useAppStore();
  const [activeTab, setActiveTab] = useState('detalhes');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  
  const evento = getEventoById(id!);
  const participantes = getParticipantesByEvento(id!);
  
  const [editData, setEditData] = useState({
    nome: '',
    local: '',
    capacidade: 0,
    politicaReentrada: true,
    prefixoQR: '',
    webhookUrl: '',
    webhookSecret: ''
  });

  useEffect(() => {
    if (evento) {
      setEditData({
        nome: evento.nome,
        local: evento.local,
        capacidade: evento.capacidade,
        politicaReentrada: evento.politicaReentrada,
        prefixoQR: evento.prefixoQR,
        webhookUrl: evento.webhooks[0]?.url || '',
        webhookSecret: evento.webhooks[0]?.secret || ''
      });
    }
  }, [evento]);

  if (!evento) {
    return (
      <div className="p-6">
        <EmptyState
          title="Evento não encontrado"
          description="O evento que você está procurando não existe."
          action={{
            label: 'Voltar para Eventos',
            onClick: () => navigate('/eventos')
          }}
        />
      </div>
    );
  }

  const filteredParticipantes = participantes.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.documento.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'todos' || p.statusCheckin === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSaveEvento = () => {
    updateEvento(evento.id, {
      nome: editData.nome,
      local: editData.local,
      capacidade: editData.capacidade,
      politicaReentrada: editData.politicaReentrada,
      prefixoQR: editData.prefixoQR,
      webhooks: editData.webhookUrl ? [{
        url: editData.webhookUrl,
        secret: editData.webhookSecret
      }] : []
    });
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      'checkin_ok': { status: 'ok' as const, label: 'Check-in OK' },
      'nao_chegou': { status: 'pendente' as const, label: 'Pendente' },
      'duplicado': { status: 'warning' as const, label: 'Duplicado' },
      'bloqueado': { status: 'erro' as const, label: 'Bloqueado' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || 
                  { status: 'pendente' as const, label: status };
    
    return <Tag status={config.status}>{config.label}</Tag>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/eventos')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{evento.nome}</h1>
          <p className="text-muted-foreground">
            {format(evento.dataInicio, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="cadastro">Cadastro do Evento</TabsTrigger>
          <TabsTrigger value="participantes">
            Participantes ({participantes.length})
          </TabsTrigger>
        </TabsList>

        {/* Detalhes Tab */}
        <TabsContent value="detalhes" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Informações do Evento</CardTitle>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
                <p className="text-lg font-medium">{evento.nome}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Local</Label>
                <p className="text-lg font-medium">{evento.local}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Capacidade</Label>
                <p className="text-lg font-medium">{evento.capacidade} pessoas</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Política de Reentrada</Label>
                <p className="text-lg font-medium">
                  {evento.politicaReentrada ? 'Permitida' : 'Não permitida'}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Data/Hora Início</Label>
                <p className="text-lg font-medium">
                  {format(evento.dataInicio, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Data/Hora Fim</Label>
                <p className="text-lg font-medium">
                  {format(evento.dataFim, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cadastro Tab */}
        <TabsContent value="cadastro" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nome">Nome do Evento</Label>
                  <Input
                    id="nome"
                    value={editData.nome}
                    onChange={(e) => setEditData(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="local">Local</Label>
                  <Input
                    id="local"
                    value={editData.local}
                    onChange={(e) => setEditData(prev => ({ ...prev, local: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="capacidade">Capacidade</Label>
                  <Input
                    id="capacidade"
                    type="number"
                    value={editData.capacidade}
                    onChange={(e) => setEditData(prev => ({ ...prev, capacidade: parseInt(e.target.value) }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="prefixo">Prefixo QR</Label>
                  <Input
                    id="prefixo"
                    value={editData.prefixoQR}
                    onChange={(e) => setEditData(prev => ({ ...prev, prefixoQR: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="reentrada"
                  checked={editData.politicaReentrada}
                  onCheckedChange={(checked) => setEditData(prev => ({ ...prev, politicaReentrada: checked }))}
                />
                <Label htmlFor="reentrada">Permitir reentrada</Label>
              </div>
              
              <div className="space-y-4">
                <Label className="text-base font-medium">Webhooks de Check-in</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="webhook-url">URL do Webhook</Label>
                    <Input
                      id="webhook-url"
                      placeholder="https://api.example.com/webhook"
                      value={editData.webhookUrl}
                      onChange={(e) => setEditData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhook-secret">Secret</Label>
                    <Input
                      id="webhook-secret"
                      placeholder="webhook_secret_123"
                      value={editData.webhookSecret}
                      onChange={(e) => setEditData(prev => ({ ...prev, webhookSecret: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSaveEvento}>
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Participantes Tab */}
        <TabsContent value="participantes" className="space-y-6">
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar participantes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="checkin_ok">Check-in OK</SelectItem>
                  <SelectItem value="nao_chegado">Pendente</SelectItem>
                  <SelectItem value="duplicado">Duplicado</SelectItem>
                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Importar CSV
              </Button>
              <Button variant="outline" size="sm">
                <QrCode className="w-4 h-4 mr-2" />
                Baixar QR Codes
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>QR Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipantes.map((participante) => (
                  <TableRow key={participante.id}>
                    <TableCell className="font-medium">
                      {participante.nome}
                    </TableCell>
                    <TableCell>{participante.email}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {participante.documento}
                    </TableCell>
                    <TableCell>{participante.tipoIngresso}</TableCell>
                    <TableCell>
                      {getStatusTag(participante.statusCheckin)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {participante.qrCode}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}