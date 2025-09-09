import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Controle do estado do modal
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
        const relacaoEventoParticipante = await eventoParticipanteService.cadastrarParticipanteEmEvento(props.eventoId, participanteCriado.participante_id);
        console.log(props.eventoId);
      }
      setIsDialogOpen(false); // Fecha o modal após o envio
    } catch (error) {
      console.error('Erro ao cadastrar participante:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Save className="w-4 h-4" />
          Cadastrar Participante
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Participante</DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-6">
          {/* Formulário para cadastrar participante */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex flex-col">
                <label htmlFor="nome" className="text-sm text-muted-foreground">
                  Nome
                </label>
                <Input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do participante"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="email" className="text-sm text-muted-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email do participante"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="tipo" className="text-sm text-muted-foreground">
                  Tipo
                </label>
                <Select value={tipo} onValueChange={(value) => setTipo(value)}>
                  <SelectTrigger className="input">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tipo</SelectLabel>
                      <SelectItem value="executivo">Executivo</SelectItem>
                      <SelectItem value="publico">Público</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
                onClick={() => setIsDialogOpen(false)} // Fecha o modal ao clicar em "Cancelar"
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CadastrarParticipante;
