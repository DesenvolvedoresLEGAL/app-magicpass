import api from './api'; // Certifique-se de que o axios está configurado corretamente

// Função para reconhecimento facial
const reconhecerFacial = async (imagem) => {
  try {
    const formData = new FormData();
    formData.append('imagem', imagem);

    const response = await api.post('/participantes/facial', formData, {
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

// Função para criar um log de entrada
const registrarEntrada = async (participanteId, metodo, dispositivo, observacao) => {
  try {
    const logData = {
      participante_id: participanteId,
      metodo: metodo,
      dispositivo: dispositivo || null,
      observacao: observacao || "",
    };

    const response = await api.post('/entradas', logData);

    return response.data;
  } catch (error) {
    console.error('Erro ao registrar log de entrada:', error);
    throw error;
  }
};

export default {
  reconhecerFacial,
  registrarEntrada, // Expondo a função para registrar a entrada
};
