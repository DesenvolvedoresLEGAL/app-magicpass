import { useState, useEffect } from 'react';
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
import eventosService from '@/services/eventosService'; // Importe o serviço
import EventoDialog from '@/components/eventos/EventoDialog'

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    local: '',
    dataInicio: '',
    dataFim: '',
    capacidade: '',
    descricao: ''
  });

  const navigate = useNavigate();

  // Carregar eventos ao montar o componente
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const eventosFetched = await eventosService.getEventos();
        console.log(eventosFetched.eventos);
        setEventos(eventosFetched.eventos);
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
      }
    };

    fetchEventos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      await eventosService.criarEvento(novoEvento);
      setIsDialogOpen(false);
      setFormData({
        nome: '',
        local: '',
        dataInicio: '',
        dataFim: '',
        capacidade: '',
        descricao: ''
      });
      // Atualizar a lista de eventos
      const eventosFetched = await eventosService.getEventos();
      setEventos(eventosFetched.eventos);
    } catch (error) {
      console.error('Erro ao criar evento:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: 'Ativo', variant: 'default' as const },
      rascunho: { label: 'Rascunho', variant: 'secondary' as const },
      finalizado: { label: 'Finalizado', variant: 'outline' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={"default"}>{"Ativo"}</Badge>;
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

        <EventoDialog />
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
                  {format(evento.data_hora_inicio, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
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
                  onClick={() => navigate(`${evento.id}`)}
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
