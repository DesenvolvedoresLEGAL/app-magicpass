import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, MapPin, Users, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Eventos() {
  const { eventos, addEvento } = useAppStore();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    local: '',
    dataInicio: '',
    dataFim: '',
    capacidade: '',
    descricao: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const novoEvento = {
      nome: formData.nome,
      slug: formData.nome.toLowerCase().replace(/\s+/g, '-'),
      dataInicio: new Date(formData.dataInicio),
      dataFim: new Date(formData.dataFim),
      local: formData.local,
      capacidade: parseInt(formData.capacidade),
      politicaReentrada: true,
      prefixoQR: formData.nome.substring(0, 4).toUpperCase(),
      webhooks: [],
      status: 'rascunho' as const
    };

    addEvento(novoEvento);
    setIsDialogOpen(false);
    setFormData({
      nome: '',
      local: '',
      dataInicio: '',
      dataFim: '',
      capacidade: '',
      descricao: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: 'Ativo', variant: 'default' as const },
      rascunho: { label: 'Rascunho', variant: 'secondary' as const },
      finalizado: { label: 'Finalizado', variant: 'outline' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Eventos</h1>
          <p className="text-muted-foreground">
            Gerencie seus eventos e credenciamento
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Evento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Evento</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Tech Conference 2024"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="local">Local</Label>
                <Input
                  id="local"
                  value={formData.local}
                  onChange={(e) => setFormData(prev => ({ ...prev, local: e.target.value }))}
                  placeholder="Ex: Centro de Convenções"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataInicio">Data/Hora Início</Label>
                  <Input
                    id="dataInicio"
                    type="datetime-local"
                    value={formData.dataInicio}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dataFim">Data/Hora Fim</Label>
                  <Input
                    id="dataFim"
                    type="datetime-local"
                    value={formData.dataFim}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataFim: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="capacidade">Capacidade</Label>
                <Input
                  id="capacidade"
                  type="number"
                  value={formData.capacidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacidade: e.target.value }))}
                  placeholder="Ex: 500"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição do evento..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Criar Evento
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventos.map((evento) => (
          <Card key={evento.id} className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{evento.nome}</CardTitle>
                {getStatusBadge(evento.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(evento.dataInicio, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {evento.local}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  Capacidade: {evento.capacidade}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate(`/eventos/${evento.id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}