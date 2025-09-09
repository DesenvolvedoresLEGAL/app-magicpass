import { useState } from 'react';
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog';
import { DialogContent } from '@/components/ui/dialog';
import { DialogHeader } from '@/components/ui/dialog';
import { DialogTitle } from '@/components/ui/dialog';
import { DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react'; // Importe o ícone Plus, se necessário
import eventosService from '@/services/eventosService'; // Importe o serviço

const EventoDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    local: '',
    dataInicio: '',
    dataFim: '',
    capacidade: '',
    descricao: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Formatar os dados conforme o formato esperado pelo backend
    const dadosEvento = {
      nome: formData.nome,
      local: formData.local,
      data_hora_inicio: formData.dataInicio,
      data_hora_fim: formData.dataFim,
      capacidade: formData.capacidade,
      descricao: formData.descricao,
      deletado: null // Campo opcional, caso o backend aceite
    };

    try {
      // Chamar a função para criar o evento
      await eventosService.criarEvento(dadosEvento);
      // Fechar o dialog após o sucesso
      setIsDialogOpen(false);
      // Resetar os campos do formulário (opcional)
      setFormData({
        nome: '',
        local: '',
        dataInicio: '',
        dataFim: '',
        capacidade: '',
        descricao: ''
      });
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      // Aqui você pode adicionar feedback ao usuário, como um toast ou alert
    }
  };

  return (
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
  );
};

export default EventoDialog;
