import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Edit, Trash, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import eventosService from '@/services/eventosService'; // Importe o serviço para eventos
import ListaParticipantes from '@/components/eventos/ListaParticipante';
import AtualizarEventoDialog from '@/components/eventos/AtualizarEventoDialog';

const EventoDetalhes = () => {
  const { id } = useParams<{ id: string }>(); // Pegando o ID da URL
  const [evento, setEvento] = useState<any | null>(null); // Estado para armazenar os dados do evento
  const [isLoading, setIsLoading] = useState<boolean>(true); // Estado para controle de carregamento
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Estado para controle do modal
  const navigate = useNavigate(); // Hook para navegação

  const handleEventoAtualizado = (eventoAtualizado) => {
    // Atualizar o evento na lista de eventos, substituindo pelo evento com o mesmo ID
    setEvento(eventoAtualizado);
  };


  // Carregar os detalhes do evento
  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const eventoFetched = await eventosService.getEventoPorId(id!);
        setEvento(eventoFetched);
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar evento:', error);
        setIsLoading(false);
      }
    };

    fetchEvento();
  }, [id]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!evento) {
    return <div>Evento não encontrado.</div>;
  }

  // Função para renderizar o badge de status
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: 'Ativo', variant: 'default' as const },
      rascunho: { label: 'Rascunho', variant: 'secondary' as const },
      finalizado: { label: 'Finalizado', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={"default"}>{"ativo"}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Detalhes do Evento</h1>
          <p className="text-muted-foreground">Visualize as informações detalhadas deste evento.</p>
        </div>
        
        <div className="flex gap-4">
          <AtualizarEventoDialog eventoId={evento.id} onEventoAtualizado={handleEventoAtualizado}/>
          <Button
            variant="outline"
            className="text-red-500"
            onClick={() => {
              if (window.confirm('Você tem certeza que deseja excluir este evento?')) {
                eventosService.deletarEvento(evento.id).then(() => {
                  navigate('/client/eventos');
                }).catch((err) => console.error('Erro ao excluir evento:', err));
              }
            }}
          >
            <Trash className="w-4 h-4 mr-2" /> Excluir
          </Button>
        </div>
      </div>

      {/* Evento Detalhes */}
      <Card className="transition-all hover:shadow-md">
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
              {format(new Date(evento.data_hora_inicio), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {evento.local}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              Capacidade: {evento.capacidade}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold">Descrição:</span>
              {evento.descricao || 'Sem descrição disponível'}
            </div>
          </div>
          
          {/* Voltar para a lista de eventos */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/client/eventos')}
            >
              Voltar para Lista de Eventos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Cadastro de Participante */}
      <ListaParticipantes eventoId={evento.id} />
    </div>
  );
};

export default EventoDetalhes;
