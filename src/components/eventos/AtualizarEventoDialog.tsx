import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react'; // Importando o ícone do calendário
import eventosService from '@/services/eventosService'; // Importe o serviço de eventos

// Função para formatar as datas no formato "YYYY-MM-DDTHH:MM"
const formatDateForInput = (date: string) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Adiciona zero à esquerda
  const day = d.getDate().toString().padStart(2, '0'); // Adiciona zero à esquerda
  const hours = d.getHours().toString().padStart(2, '0'); // Adiciona zero à esquerda
  const minutes = d.getMinutes().toString().padStart(2, '0'); // Adiciona zero à esquerda

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const AtualizarEventoDialog = ({ eventoId, onEventoAtualizado }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    local: '',
    data_hora_inicio: '',
    data_hora_fim: '',
    capacidade: '',
    descricao: ''
  });

  // Carregar dados do evento ao abrir o diálogo
  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const evento = await eventosService.getEventoPorId(eventoId);
        setFormData({
          nome: evento.nome,
          local: evento.local,
          data_hora_inicio: formatDateForInput(evento.data_hora_inicio),
          data_hora_fim: formatDateForInput(evento.data_hora_fim),
          capacidade: evento.capacidade,
          descricao: evento.descricao
        });
      } catch (error) {
        console.error('Erro ao carregar evento:', error);
      }
    };

    if (eventoId) {
      fetchEvento();
    }
  }, [eventoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Garantir que as datas sejam válidas
    const inicio = new Date(formData.data_hora_inicio);
    const fim = new Date(formData.data_hora_fim);

    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      alert('Por favor, insira datas válidas');
      return;
    }

    // Formatar as datas para o formato DATETIME do MySQL
    const dadosEvento = {
      nome: formData.nome,
      local: formData.local,
      data_hora_inicio: formatDateForInput(formData.data_hora_inicio),
      data_hora_fim: formatDateForInput(formData.data_hora_fim),
      capacidade: formData.capacidade,
      descricao: formData.descricao,
    };

    try {
      // Chamar a função para atualizar o evento
      const eventoAtualizado = await eventosService.atualizarEvento(eventoId, dadosEvento);
      // Enviar o evento atualizado para o componente pai
      onEventoAtualizado(dadosEvento);
      // Fechar o dialog após o sucesso
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      // Aqui você pode adicionar feedback ao usuário, como um toast ou alert
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
          <Calendar className="w-4 h-4" />
          Atualizar Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Evento</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Tech Conference 2024"
              required
            />
          </div>

          <div>
            <Label htmlFor="local">Local</Label>
            <Input
              id="local"
              value={formData.local}
              onChange={(e) => setFormData((prev) => ({ ...prev, local: e.target.value }))}
              placeholder="Ex: Centro de Convenções"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_hora_inicio">Data/Hora Início</Label>
              <Input
                id="data_hora_inicio"
                type="datetime-local"
                value={formData.data_hora_inicio}
                onChange={(e) => setFormData((prev) => ({ ...prev, data_hora_inicio: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="data_hora_fim">Data/Hora Fim</Label>
              <Input
                id="data_hora_fim"
                type="datetime-local"
                value={formData.data_hora_fim}
                onChange={(e) => setFormData((prev) => ({ ...prev, data_hora_fim: e.target.value }))}
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
              onChange={(e) => setFormData((prev) => ({ ...prev, capacidade: e.target.value }))}
              placeholder="Ex: 500"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição do evento..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Atualizar Evento
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
  );
};

export default AtualizarEventoDialog;
