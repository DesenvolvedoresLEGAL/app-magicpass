import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Eye } from 'lucide-react';
import eventoParticipanteService from '@/services/eventoParticipanteService';
import CadastrarParticipante from '../participantes/CadastrarParticipante';

interface Participante {
  id: number;
  participante_nome: string;
  participante_email: string;
}

interface ParticipantesProps {
  eventoId: number; // ID do evento que queremos buscar os participantes
}

export default function ListaParticipantes({ eventoId }: ParticipantesProps) {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [pagina, setPagina] = useState<number>(1);
  const [totalParticipantes, setTotalParticipantes] = useState<number>(0);
  const [limit] = useState(10); // Quantidade de participantes por página

  useEffect(() => {
    const fetchParticipantes = async () => {
      try {
        const { participantes_evento, total } = await eventoParticipanteService.getParticipantesPorEvento(eventoId, pagina, limit);
        setParticipantes(participantes_evento);
        setTotalParticipantes(total);
      } catch (error) {
        console.error('Erro ao buscar participantes:', error);
      }
    };

    fetchParticipantes();
  }, [eventoId, pagina, limit]);

  const handlePaginaChange = (pagina: number) => {
    setPagina(pagina);
  };

  // Função chamada quando um novo participante é criado no modal
  const handleParticipanteCriado = (novoParticipante: any) => {
    // Adaptar o objeto para o formato esperado na lista
    const participanteFormatado: Participante = {
      id: novoParticipante.id,
      participante_nome: novoParticipante.nome,
      participante_email: novoParticipante.email,
    };

    setParticipantes(prev => [participanteFormatado, ...prev]);
    setTotalParticipantes(prevTotal => prevTotal + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className='grid grid-cols-2 align-center'>
          <h1 className="text-3xl font-bold">Participantes do Evento</h1>
          {/* Botão para abrir modal de cadastro */}
          <div className="w-full flex justify-end">
            <CadastrarParticipante eventoId={eventoId} onParticipanteCriado={handleParticipanteCriado} />
          </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participantes.map((participante) => (
            <TableRow key={participante.id}>
              <TableCell>{participante.participante_nome}</TableCell>
              <TableCell>{participante.participante_email}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Paginação */}
      <Pagination
        currentPage={pagina}
        totalItems={totalParticipantes}
        itemsPerPage={limit}
        onPageChange={handlePaginaChange}
      />
    </div>
  );
}
