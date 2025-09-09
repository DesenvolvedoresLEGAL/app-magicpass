import api from './api'; // Caminho para o seu arquivo de configuração do axios

const EVENTOS_ENDPOINT = 'eventos';


// Função para obter todos os eventos
const getEventos = async () => {
  try {
    const response = await api.get(`${EVENTOS_ENDPOINT}/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    throw error;
  }
};

// Função para obter um evento por ID
const getEventoPorId = async (id) => {
  try {
    const response = await api.get(`${EVENTOS_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar evento com ID ${id}:`, error);
    throw error;
  }
};

// Função para criar um novo evento
const criarEvento = async (dadosEvento) => {
  try {
    const response = await api.post(`${EVENTOS_ENDPOINT}/`, dadosEvento);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    throw error;
  }
};

// Função para atualizar um evento existente
const atualizarEvento = async (id, dadosAtualizados) => {
  try {
    const response = await api.patch(`${EVENTOS_ENDPOINT}/${id}`, dadosAtualizados);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar evento com ID ${id}:`, error);
    throw error;
  }
};

// Função para deletar um evento
const deletarEvento = async (id) => {
  try {
    const response = await api.delete(`${EVENTOS_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao deletar evento com ID ${id}:`, error);
    throw error;
  }
};

export default {
  getEventos,
  getEventoPorId,
  criarEvento,
  atualizarEvento,
  deletarEvento,
};
