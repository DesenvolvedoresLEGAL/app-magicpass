import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scan, Shield, BarChart3, QrCode, Zap, CheckCircle, Rocket } from 'lucide-react';

interface WelcomeStepProps {
  onValidationChange: (isValid: boolean) => void;
}

export function WelcomeStep({ onValidationChange }: WelcomeStepProps) {
  useEffect(() => {
    onValidationChange(true);
  }, [onValidationChange]);

  const benefits = [
    {
      icon: <Scan className="h-6 w-6 text-primary" />,
      title: 'Reconhecimento Facial',
      description: 'Acesso rápido e seguro através de biometria avançada'
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: 'Controle de Acesso Inteligente',
      description: 'QR Codes e múltiplas formas de entrada segura'
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      title: 'Analytics em Tempo Real',
      description: 'Monitore acessos e fluxo de pessoas instantaneamente'
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: 'Gestão Completa',
      description: 'Controle total dos acessos da sua organização'
    }
  ];

  return (
    <div className="text-center space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="bg-primary/10 p-4 rounded-full"
          >
            <Rocket className="h-12 w-12 text-primary" />
          </motion.div>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground">
          Bem-vindo ao MagicPass!
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Vamos configurar sua plataforma de acesso em apenas <strong>5 minutos</strong> para que você possa 
          começar a oferecer controle de acesso inteligente hoje mesmo.
        </p>
      </motion.div>

      {/* Benefits Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
      >
        {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="bg-card border rounded-lg p-6 text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                {benefit.icon}
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="bg-primary/5 border border-primary/20 rounded-lg p-6 max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <CheckCircle className="h-5 w-5 text-primary" />
          <span className="font-medium text-primary">Configuração Rápida</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Nossa configuração guiada irá ajudá-lo a personalizar a plataforma de acordo com 
          suas necessidades e configurar seu primeiro ambiente de acesso em poucos cliques.
        </p>
      </motion.div>
    </div>
  );
}