import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Save, Trash } from 'lucide-react';
import participantesService from '@/services/participantesService';
import eventoParticipanteService from '@/services/eventoParticipanteService';

const CadastrarParticipante = (props) => {
  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [tipo, setTipo] = useState<string>('executivo');
  const [imagem, setImagem] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Referência para o elemento de vídeo da câmera
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Função para iniciar a câmera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error);
    }
  };

  // Função para capturar a foto
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setPhotoUrl(dataUrl);
        setImagem(dataURLtoFile(dataUrl, 'foto.png')); // Converte para File para envio
      }
    }
  };

  // Função para converter Data URL para File
  const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime || 'image/png' });
  };

  const handleSubmit = async () => {
    if (!nome || !email) {
      alert('Preencha todos os campos!');
      return;
    }

    const participanteData = {
      nome,
      email,
      tipo,
      entrada_realizada: false,
      face_embedding: null,
      qr_code_path: null,
      imagem, // Enviando a imagem capturada
    };

    try {
      setIsSubmitting(true);
      const participanteCriado = await participantesService.criarParticipante(participanteData);
      console.log('Participante criado com sucesso:', participanteCriado);
      if (props.eventoId) {
        const relacaoEventoParticipante = await eventoParticipanteService.cadastrarParticipanteEmEvento(props.eventoId, participanteCriado.participante_id)
        console.log(props.eventoId);
      }
      navigate('/client/participantes'); // Navegar para a lista de participantes
    } catch (error) {
      console.error('Erro ao cadastrar participante:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cadastrar Novo Participante</h1>
      </div>

      {/* Formulário para cadastrar participante */}
      <Card className="transition-all hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Informações do Participante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-col">
              <label htmlFor="nome" className="text-sm text-muted-foreground">
                Nome
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="input"
                placeholder="Nome do participante"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="Email do participante"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="tipo" className="text-sm text-muted-foreground">
                Tipo
              </label>
              <select
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="input"
              >
                <option value="executivo">Executivo</option>
                <option value="publico">Público</option>
              </select>
            </div>

            {/* Captura de imagem da câmera */}
            <div className="flex flex-col">
              <label className="text-sm text-muted-foreground">Foto do Participante</label>
              {photoUrl ? (
                <div className="mt-2">
                  <img src={photoUrl} alt="Foto do Participante" className="w-full h-auto rounded-md" />
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setPhotoUrl(null)}
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Remover Foto
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <video ref={videoRef} autoPlay className="w-full h-auto rounded-md" />
                </div>
              )}
              <div className="flex gap-2 mt-2">
                {!photoUrl ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={startCamera}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Iniciar Câmera
                    </Button>
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={capturePhoto}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Capturar Foto
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/client/participantes')}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Cadastrando...' : <><Save className="w-4 h-4 mr-2" />Cadastrar</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CadastrarParticipante;
