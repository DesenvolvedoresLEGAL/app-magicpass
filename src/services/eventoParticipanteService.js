import api from './api'; // Caminho para o seu arquivo de configuração do axios

const EVENTO_PARTICIPANTE_ENDPOINT = 'evento_participante';

// Função para obter os eventos de um participante
const getEventosPorParticipante = async (participanteId, page = 1, limit = 10) => {
  try {
    const response = await api.get(`${EVENTO_PARTICIPANTE_ENDPOINT}/eventos/${participanteId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar eventos para o participante ${participanteId}:`, error);
    throw error;
  }
};

// Função para obter os participantes de um evento
const getParticipantesPorEvento = async (eventoId, page = 1, limit = 10) => {
  try {
    const response = await api.get(`${EVENTO_PARTICIPANTE_ENDPOINT}/participantes/${eventoId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar participantes para o evento ${eventoId}:`, error);
    throw error;
  }
};

// Função para cadastrar um participante em um evento
const cadastrarParticipanteEmEvento = async (eventoId, participanteId) => {
  try {
    const response = await api.post(`${EVENTO_PARTICIPANTE_ENDPOINT}/eventos/${eventoId}/participantes/${participanteId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao cadastrar participante ${participanteId} no evento ${eventoId}:`, error);
    throw error;
  }
};

// Função para remover um participante de um evento
const removerParticipanteDeEvento = async (eventoId, participanteId) => {
  try {
    const response = await api.delete(`${EVENTO_PARTICIPANTE_ENDPOINT}/eventos/${eventoId}/participantes/${participanteId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao remover participante ${participanteId} do evento ${eventoId}:`, error);
    throw error;
  }
};

export default {
  getEventosPorParticipante,
  getParticipantesPorEvento,
  cadastrarParticipanteEmEvento,
  removerParticipanteDeEvento
};
