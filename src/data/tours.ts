import { TourStep } from '@/store/useOnboardingStore';

export const dashboardTour: TourStep[] = [
  {
    target: '.kpi-cards',
    title: 'Visão Geral dos KPIs',
    content: 'Aqui você acompanha as métricas principais dos seus eventos em tempo real: total de inscrições, check-ins realizados e taxa de conversão.',
    placement: 'bottom'
  },
  {
    target: '.recent-events',
    title: 'Eventos Recentes',
    content: 'Lista dos seus eventos mais recentes com informações rápidas sobre status e participação.',
    placement: 'top'
  },
  {
    target: '.performance-chart',
    title: 'Gráfico de Performance',
    content: 'Visualize o desempenho dos seus eventos ao longo do tempo. Você pode alternar entre diferentes métricas.',
    placement: 'left'
  },
  {
    target: '.notifications-center',
    title: 'Central de Notificações',
    content: 'Receba alertas importantes sobre seus eventos, como novas inscrições e check-ins.',
    placement: 'bottom'
  }
];

export const eventsTour: TourStep[] = [
  {
    target: '[data-tour="create-event"]',
    title: 'Criar Novo Evento',
    content: 'Clique aqui para criar um novo evento. O assistente te guiará através de todas as configurações necessárias.',
    placement: 'bottom'
  },
  {
    target: '[data-tour="events-list"]',
    title: 'Lista de Eventos',
    content: 'Todos os seus eventos aparecem aqui. Você pode filtrar por status, data ou nome para encontrar rapidamente o que procura.',
    placement: 'top'
  },
  {
    target: '[data-tour="event-actions"]',
    title: 'Ações do Evento',
    content: 'Para cada evento, você pode ver detalhes, editar configurações, visualizar inscrições ou acessar a página pública.',
    placement: 'left'
  },
  {
    target: '[data-tour="event-status"]',
    title: 'Status do Evento',
    content: 'O status indica se o evento está em rascunho, ativo (recebendo inscrições) ou finalizado.',
    placement: 'right'
  }
];

export const analyticsTour: TourStep[] = [
  {
    target: '[data-tour="funnel-chart"]',
    title: 'Funil de Conversão',
    content: 'Acompanhe o caminho dos visitantes: desde a visualização da página até o check-in no evento.',
    placement: 'bottom'
  },
  {
    target: '[data-tour="comparison-chart"]',
    title: 'Comparação de Eventos',
    content: 'Compare a performance entre diferentes eventos para identificar padrões e oportunidades de melhoria.',
    placement: 'top'
  },
  {
    target: '[data-tour="temporal-trends"]',
    title: 'Tendências Temporais',
    content: 'Visualize como as inscrições e check-ins evoluem ao longo do tempo, ajudando no planejamento.',
    placement: 'left'
  },
  {
    target: '[data-tour="demographics"]',
    title: 'Demografia dos Participantes',
    content: 'Entenda melhor seu público através da análise demográfica dos participantes.',
    placement: 'right'
  },
  {
    target: '[data-tour="export-data"]',
    title: 'Exportar Dados',
    content: 'Exporte os dados para análises mais profundas ou relatórios personalizados.',
    placement: 'bottom'
  }
];

export const financialTour: TourStep[] = [
  {
    target: '[data-tour="financial-kpis"]',
    title: 'Métricas Financeiras',
    content: 'Acompanhe receita total, valor médio por transação e outras métricas financeiras importantes.',
    placement: 'bottom'
  },
  {
    target: '[data-tour="transactions-tab"]',
    title: 'Transações',
    content: 'Visualize todas as transações dos seus eventos com detalhes sobre pagamentos e status.',
    placement: 'top'
  },
  {
    target: '[data-tour="invoices-tab"]',
    title: 'Faturas',
    content: 'Gerencie faturas relacionadas aos seus eventos, incluindo valores de impostos e vencimentos.',
    placement: 'top'
  },
  {
    target: '[data-tour="financial-filters"]',
    title: 'Filtros Financeiros',
    content: 'Use os filtros para analisar dados financeiros por período, status ou evento específico.',
    placement: 'bottom'
  }
];

export const credentialTour: TourStep[] = [
  {
    target: '[data-tour="qr-scanner"]',
    title: 'Scanner QR Code',
    content: 'Use a câmera para escanear os QR codes dos participantes e realizar check-ins automaticamente.',
    placement: 'bottom'
  },
  {
    target: '[data-tour="manual-checkin"]',
    title: 'Check-in Manual',
    content: 'Realize check-ins manualmente pesquisando por nome, email ou código do participante.',
    placement: 'top'
  },
  {
    target: '[data-tour="participant-list"]',
    title: 'Lista de Participantes',
    content: 'Visualize todos os participantes inscritos e seu status de check-in em tempo real.',
    placement: 'left'
  },
  {
    target: '[data-tour="bulk-actions"]',
    title: 'Ações em Lote',
    content: 'Realize ações em múltiplos participantes simultaneamente, como envio de emails ou check-ins.',
    placement: 'right'
  }
];

export const allTours = {
  dashboard: dashboardTour,
  events: eventsTour,
  analytics: analyticsTour,
  financial: financialTour,
  credential: credentialTour
};