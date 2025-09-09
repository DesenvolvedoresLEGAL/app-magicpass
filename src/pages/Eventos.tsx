import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import eventosService from '@/services/eventosService';
import EventoDialog from '@/components/eventos/EventoDialog';

export default function Eventos() {
  const [eventos, setEventos] = useState([]);

  const navigate = useNavigate();

  const handleEventoCriado = (novoEvento) => {

    // Verifique se a lista de eventos está vazia
    const ultimoId = eventos.length > 0 ? eventos[eventos.length - 1].id : 0;
    
    // Atribua um novo ID ao novo evento
    novoEvento.id = ultimoId + 1;

    // Agora adicione o novo evento ao estado
    setEventos((prevEventos) => [...prevEventos, novoEvento]);
  };


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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: 'Ativo', variant: 'default' as const },
      rascunho: { label: 'Rascunho', variant: 'secondary' as const },
      finalizado: { label: 'Finalizado', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={"default"}>{"Ativo"}</Badge>;
  };

  const isValidDate = (date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
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

        <EventoDialog onEventoCriado={handleEventoCriado} />
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
                  {isValidDate(evento.data_hora_inicio)
                    ? format(new Date(evento.data_hora_inicio), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
                    : 'Data inválida'}
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
