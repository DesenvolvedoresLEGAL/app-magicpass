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
    return response.data.contagem; 
  } catch (error) {
    console.error('Erro ao buscar contagem de participantes:', error);
    throw error;
  }
};

// Função para obter um participante por ID
const getParticipantePorId = async (id) => {
  try {
    const response = await api.get(`${PARTICIPANTES_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar participante com ID ${id}:`, error);
    throw error;
  }
};

// Função para criar um novo participante
const criarParticipante = async (dadosParticipante) => {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify(dadosParticipante));

    // Adicionar a imagem, se houver
    if (dadosParticipante.imagem) {
      formData.append('imagem', dadosParticipante.imagem);
    }

    const response = await api.post(`${PARTICIPANTES_ENDPOINT}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao criar participante:', error);
    throw error;
  }
};

// Função para atualizar um participante existente
const atualizarParticipante = async (id, dadosAtualizados) => {
  try {
    const response = await api.patch(`${PARTICIPANTES_ENDPOINT}/${id}`, dadosAtualizados);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar participante com ID ${id}:`, error);
    throw error;
  }
};

// Função para deletar um participante
const deletarParticipante = async (id) => {
  try {
    const response = await api.delete(`${PARTICIPANTES_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao deletar participante com ID ${id}:`, error);
    throw error;
  }
};

// Função para gerar e obter o QR code do participante
const getQRCodeParticipante = async (id) => {
  try {
    const response = await api.get(`${PARTICIPANTES_ENDPOINT}/${id}/qrcode`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao obter QR code para participante com ID ${id}:`, error);
    throw error;
  }
};

// Função para reconhecimento facial
const reconhecerFacial = async (imagem) => {
  try {
    const formData = new FormData();
    formData.append('imagem', imagem);

    const response = await api.post(`${PARTICIPANTES_ENDPOINT}/facial`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao realizar reconhecimento facial:', error);
    throw error;
  }
};

// Função para contar o total de participantes
const contarParticipantes = async () => {
  try {
    const response = await api.get(`${PARTICIPANTES_ENDPOINT}/count`);
    return response.data;
  } catch (error) {
    console.error('Erro ao contar participantes:', error);
    throw error;
  }
};

export default {
  getParticipantes,
  getParticipantePorId,
  criarParticipante,
  atualizarParticipante,
  deletarParticipante,
  getQRCodeParticipante,
  reconhecerFacial,
  contarParticipantes,
  getContagemParticipantes
};
