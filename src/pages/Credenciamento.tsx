import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/useAppStore';
import { 
  QrCode, 
  Camera, 
  User,
  CheckCircle,
  XCircle,
  Upload,
  Play,
  Pause
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Credenciamento() {
  const { findByQr, registrarCheckin } = useAppStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('qr');
  const [isScanning, setIsScanning] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    participante?: any;
    message: string;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Start/Stop camera
  useEffect(() => {
    if (activeTab === 'qr' && isScanning) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => stopCamera();
  }, [activeTab, isScanning]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const processQrCode = (qrCode: string) => {
    const participante = findByQr(qrCode);
    
    if (!participante) {
      setLastResult({
        success: false,
        message: 'QR Code inválido ou não encontrado'
      });
      return;
    }

    if (participante.statusCheckin === 'checkin_ok') {
      setLastResult({
        success: false,
        participante,
        message: 'Participante já realizou check-in'
      });
      return;
    }

    const success = registrarCheckin(participante.id, 'qr');
    
    if (success) {
      setLastResult({
        success: true,
        participante,
        message: 'Check-in realizado com sucesso!'
      });
      
      toast({
        title: "Check-in realizado!",
        description: `${participante.nome} - ${participante.tipoIngresso}`,
      });
    } else {
      setLastResult({
        success: false,
        participante,
        message: 'Erro ao realizar check-in'
      });
    }
  };

  const handleManualQr = () => {
    if (qrInput.trim()) {
      processQrCode(qrInput.trim());
      setQrInput('');
    }
  };

  const simulateQrScan = () => {
    // Simulate scanning a valid QR code for demo
    processQrCode('TC24-000001');
  };

  const simulateFaceMatch = () => {
    // Simulate facial recognition match
    const participante = findByQr('TC24-000002');
    if (participante) {
      registrarCheckin(participante.id, 'face');
      toast({
        title: "Reconhecimento facial!",
        description: `${participante.nome} identificado com sucesso`,
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Credenciamento</h1>
        <p className="text-muted-foreground">
          Realize check-ins usando QR Code ou reconhecimento facial
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="qr">Scanner QR</TabsTrigger>
          <TabsTrigger value="face">Reconhecimento</TabsTrigger>
          <TabsTrigger value="welcome">Boas-vindas</TabsTrigger>
        </TabsList>

        {/* QR Scanner Tab */}
        <TabsContent value="qr" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Camera */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Scanner QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                      
                      {/* Scanning line */}
                      {isScanning && (
                        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary scan-line"></div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsScanning(!isScanning)}
                    className="flex-1"
                    variant={isScanning ? "destructive" : "default"}
                  >
                    {isScanning ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Parar Scanner
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar Scanner
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={simulateQrScan}
                    variant="outline"
                  >
                    Demo
                  </Button>
                </div>

                {/* Manual input */}
                <div className="space-y-2">
                  <Label htmlFor="manual-qr">Entrada Manual de QR</Label>
                  <div className="flex gap-2">
                    <Input
                      id="manual-qr"
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                      placeholder="Ex: TC24-000001"
                      onKeyDown={(e) => e.key === 'Enter' && handleManualQr()}
                    />
                    <Button onClick={handleManualQr}>
                      Processar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Result */}
            <Card>
              <CardHeader>
                <CardTitle>Resultado do Check-in</CardTitle>
              </CardHeader>
              <CardContent>
                {lastResult ? (
                  <div className={`p-6 rounded-lg text-center space-y-4 ${
                    lastResult.success 
                      ? 'bg-success/10 border border-success/20' 
                      : 'bg-error/10 border border-error/20'
                  }`}>
                    {lastResult.success ? (
                      <CheckCircle className="w-16 h-16 mx-auto text-success" />
                    ) : (
                      <XCircle className="w-16 h-16 mx-auto text-error" />
                    )}
                    
                    <div>
                      <h3 className={`text-xl font-bold ${
                        lastResult.success ? 'text-success' : 'text-error'
                      }`}>
                        {lastResult.message}
                      </h3>
                      
                      {lastResult.participante && (
                        <div className="mt-4 space-y-2">
                          <p className="text-lg font-medium">
                            {lastResult.participante.nome}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {lastResult.participante.tipoIngresso}
                          </p>
                          <p className="text-xs font-mono">
                            {lastResult.participante.qrCode}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => setLastResult(null)}
                      variant="outline"
                    >
                      Continuar
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <QrCode className="w-16 h-16 mx-auto mb-4" />
                    <p>Aguardando leitura de QR Code...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Face Recognition Tab */}
        <TabsContent value="face" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Reconhecimento Facial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-12 space-y-4">
                <User className="w-16 h-16 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-medium">Funcionalidade em Desenvolvimento</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  O reconhecimento facial será implementado nas próximas versões. 
                  Use o botão abaixo para simular um match.
                </p>
                <div className="space-y-2">
                  <Button onClick={simulateFaceMatch} className="mr-2">
                    Simular Match
                  </Button>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Foto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Welcome Tab */}
        <TabsContent value="welcome" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Painel de Boas-vindas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 space-y-6">
                <div className="text-6xl">🎉</div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Bem-vindo ao Evento!
                </h2>
                <p className="text-xl text-muted-foreground">
                  Tenha uma experiência incrível!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                  <Button 
                    size="lg" 
                    className="h-16 text-lg"
                    onClick={() => toast({ title: "Mensagem enviada!", description: "Bom evento!" })}
                  >
                    Bom Evento! 🎊
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-16 text-lg"
                    onClick={() => toast({ title: "Mensagem enviada!", description: "Aproveite!" })}
                  >
                    Aproveite! ✨
                  </Button>
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    className="h-16 text-lg"
                    onClick={() => toast({ title: "Mensagem enviada!", description: "Networking!" })}
                  >
                    Networking! 🤝
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}