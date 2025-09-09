import api from './api'; // Caminho para o seu arquivo de configuração do axios

const PARTICIPANTES_ENDPOINT = 'participantes';
const PARTICIPANTES_CONTAGEM_ENDPOINT = 'participantes/count'; // Nova rota para contagem

// Função para pegar todos os participantes
const getParticipantes = async () => {
  try {
    const response = await api.get(PARTICIPANTES_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar participantes:', error);
    throw error;
  }
};

// Função para pegar a contagem de participantes
const getContagemParticipantes = async () => {
  try {
    const response = await api.get(PARTICIPANTES_CONTAGEM_ENDPOINT);
    return response.data.contagem; // Espera um objeto com a chave 'contagem'
  } catch (error) {
    console.error('Erro ao buscar contagem de participantes:', error);
    throw error;
  }
};

export default {
  getParticipantes,
  getContagemParticipantes, // Expondo a função de contagem
};
