import api from './api'; // Certifique-se de ter a configuração correta do axios

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

export default {
  reconhecerFacial,
};
