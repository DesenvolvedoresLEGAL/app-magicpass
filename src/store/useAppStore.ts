import { create } from 'zustand';
import { subDays, addMinutes, format } from 'date-fns';

// Types
export interface Evento {
  id: string;
  nome: string;
  slug: string;
  dataInicio: Date;
  dataFim: Date;
  local: string;
  capacidade: number;
  politicaReentrada: boolean;
  prefixoQR: string;
  webhooks: {
    url: string;
    secret: string;
  }[];
  status: 'rascunho' | 'ativo' | 'finalizado';
}

export interface Participante {
  id: string;
  eventoId: string;
  nome: string;
  email: string;
  documento: string;
  tipoIngresso: string;
  statusCheckin: 'nao_chegado' | 'checkin_ok' | 'duplicado' | 'bloqueado';
  qrCode: string;
  lote?: string;
}

export interface Checkin {
  id: string;
  eventoId: string;
  participanteId: string;
  metodo: 'qr' | 'face' | 'manual';
  timestamp: Date;
}

interface AppState {
  eventos: Evento[];
  participantes: Participante[];
  checkins: Checkin[];
  
  // Actions
  addEvento: (evento: Omit<Evento, 'id'>) => void;
  updateEvento: (id: string, evento: Partial<Evento>) => void;
  addParticipante: (participante: Omit<Participante, 'id' | 'qrCode'>) => void;
  registrarCheckin: (participanteId: string, metodo: 'qr' | 'face' | 'manual') => boolean;
  findByQr: (qrCode: string) => Participante | null;
  getEventoById: (id: string) => Evento | null;
  getParticipantesByEvento: (eventoId: string) => Participante[];
  getCheckinsByEvento: (eventoId: string) => Checkin[];
  estatisticasHoje: (eventoId: string) => {
    entradasHoje: number;
    checkinsUltimoMinuto: number;
    participantesCadastrados: number;
    pendentes: number;
  };
  ultimosCheckins: (limit: number) => Array<{
    id: string;
    nome: string;
    hora: string;
    metodo: string;
  }>;
  entradasPorMinuto: () => Array<{
    minuto: string;
    entradas: number;
  }>;
}

// Generate mock data
const generateMockData = () => {
  const evento: Evento = {
    id: '1',
    nome: 'Tech Conference 2024',
    slug: 'tech-conference-2024',
    dataInicio: new Date(),
    dataFim: addMinutes(new Date(), 480), // 8 hours
    local: 'Centro de Convenções - São Paulo',
    capacidade: 500,
    politicaReentrada: true,
    prefixoQR: 'TC24',
    webhooks: [
      {
        url: 'https://api.exemplo.com/webhook',
        secret: 'webhook_secret_123'
      }
    ],
    status: 'ativo'
  };

  const participantes: Participante[] = [];
  const checkins: Checkin[] = [];

  // Generate 200 participants
  for (let i = 1; i <= 200; i++) {
    const participante: Participante = {
      id: String(i),
      eventoId: '1',
      nome: `Participante ${i}`,
      email: `participante${i}@example.com`,
      documento: `${String(i).padStart(8, '0')}`,
      tipoIngresso: ['VIP', 'Standard', 'Student'][i % 3],
      statusCheckin: i <= 40 ? 'checkin_ok' : 'nao_chegado',
      qrCode: `TC24-${String(i).padStart(6, '0')}`,
      lote: `Lote ${Math.ceil(i / 50)}`
    };
    participantes.push(participante);

    // Generate checkins for first 40 participants
    if (i <= 40) {
      const checkin: Checkin = {
        id: String(i),
        eventoId: '1',
        participanteId: String(i),
        metodo: ['qr', 'face', 'manual'][i % 3] as 'qr' | 'face' | 'manual',
        timestamp: subDays(new Date(), Math.random() * 2)
      };
      checkins.push(checkin);
    }
  }

  return { evento, participantes, checkins };
};

const { evento, participantes, checkins } = generateMockData();

export const useAppStore = create<AppState>((set, get) => ({
  eventos: [evento],
  participantes,
  checkins,

  addEvento: (evento) => set((state) => ({
    eventos: [...state.eventos, { ...evento, id: Date.now().toString() }]
  })),

  updateEvento: (id, eventoUpdate) => set((state) => ({
    eventos: state.eventos.map(e => e.id === id ? { ...e, ...eventoUpdate } : e)
  })),

  addParticipante: (participante) => set((state) => {
    const newParticipante: Participante = {
      ...participante,
      id: Date.now().toString(),
      qrCode: `${participante.eventoId}-${Date.now()}`
    };
    return {
      participantes: [...state.participantes, newParticipante]
    };
  }),

  registrarCheckin: (participanteId, metodo) => {
    const state = get();
    const participante = state.participantes.find(p => p.id === participanteId);
    
    if (!participante) return false;
    if (participante.statusCheckin === 'checkin_ok') return false; // Duplicado
    if (participante.statusCheckin === 'bloqueado') return false;

    const newCheckin: Checkin = {
      id: Date.now().toString(),
      eventoId: participante.eventoId,
      participanteId,
      metodo,
      timestamp: new Date()
    };

    set((state) => ({
      checkins: [...state.checkins, newCheckin],
      participantes: state.participantes.map(p => 
        p.id === participanteId 
          ? { ...p, statusCheckin: 'checkin_ok' as const }
          : p
      )
    }));

    return true;
  },

  findByQr: (qrCode) => {
    const state = get();
    return state.participantes.find(p => p.qrCode === qrCode) || null;
  },

  getEventoById: (id) => {
    const state = get();
    return state.eventos.find(e => e.id === id) || null;
  },

  getParticipantesByEvento: (eventoId) => {
    const state = get();
    return state.participantes.filter(p => p.eventoId === eventoId);
  },

  getCheckinsByEvento: (eventoId) => {
    const state = get();
    return state.checkins.filter(c => c.eventoId === eventoId);
  },

  estatisticasHoje: (eventoId) => {
    const state = get();
    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    
    const checkinsHoje = state.checkins.filter(c => 
      c.eventoId === eventoId && c.timestamp >= inicioHoje
    );
    
    const checkinsUltimoMinuto = state.checkins.filter(c => 
      c.eventoId === eventoId && 
      c.timestamp >= subDays(new Date(), 1/1440) // 1 minute ago
    );

    const participantes = state.participantes.filter(p => p.eventoId === eventoId);
    const participantesCheckin = participantes.filter(p => p.statusCheckin === 'checkin_ok');

    return {
      entradasHoje: checkinsHoje.length,
      checkinsUltimoMinuto: checkinsUltimoMinuto.length,
      participantesCadastrados: participantes.length,
      pendentes: participantes.length - participantesCheckin.length
    };
  },

  ultimosCheckins: (limit) => {
    const state = get();
    return state.checkins
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
      .map(checkin => {
        const participante = state.participantes.find(p => p.id === checkin.participanteId);
        return {
          id: checkin.id,
          nome: participante?.nome || 'Desconhecido',
          hora: format(checkin.timestamp, 'HH:mm'),
          metodo: checkin.metodo === 'qr' ? 'QR Code' : 
                 checkin.metodo === 'face' ? 'Facial' : 'Manual'
        };
      });
  },

  entradasPorMinuto: () => {
    const state = get();
    const agora = new Date();
    const ultimosMinutos = [];
    
    for (let i = 14; i >= 0; i--) {
      const minuto = subDays(agora, i / 1440); // i minutes ago
      const checkinsDoMinuto = state.checkins.filter(c => {
        const diffMinutos = Math.floor((agora.getTime() - c.timestamp.getTime()) / 60000);
        return diffMinutos === i;
      });
      
      ultimosMinutos.push({
        minuto: format(minuto, 'HH:mm'),
        entradas: checkinsDoMinuto.length
      });
    }
    
    return ultimosMinutos;
  }
}));