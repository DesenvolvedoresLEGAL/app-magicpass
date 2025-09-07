import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Shield, Users, BarChart3, Settings, ExternalLink, Rocket, Scan } from 'lucide-react';

interface SuccessStepProps {
  onValidationChange: (isValid: boolean) => void;
}

export function SuccessStep({ onValidationChange }: SuccessStepProps) {
  const { onboardingData } = useOnboardingStore();

  useEffect(() => {
    onValidationChange(true);
  }, [onValidationChange]);

  const nextSteps = [
    {
      icon: <Shield className="h-5 w-5 text-primary" />,
      title: 'Acesse o Dashboard',
      description: 'Visualize métricas e gerencie seus acessos',
      action: 'Ir para Dashboard',
      href: '/client'
    },
    {
      icon: <Scan className="h-5 w-5 text-primary" />,
      title: 'Configurar Câmeras',
      description: 'Configure o reconhecimento facial e QR codes',
      action: 'Configurar Acesso',
      href: '/configuracoes'
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-primary" />,
      title: 'Analytics',
      description: 'Acompanhe acessos e fluxo de pessoas',
      action: 'Ver Analytics',
      href: '/relatorios'
    },
    {
      icon: <Users className="h-5 w-5 text-primary" />,
      title: 'Cadastrar Usuários',
      description: 'Adicione pessoas autorizadas ao sistema',
      action: 'Gerenciar Usuários',
      href: '/credenciamento'
    }
  ];

  const completedItems = [
    {
      label: 'Organização configurada',
      value: onboardingData.companyName || 'Empresa',
      completed: !!onboardingData.companyName
    },
    {
      label: 'Identidade visual',
      value: onboardingData.logoUrl ? 'Logo adicionado' : 'Cores configuradas',
      completed: !!(onboardingData.logoUrl || onboardingData.primaryColor)
    },
    {
      label: 'Equipe convidada',
      value: `${onboardingData.teamEmails?.length || 0} membros`,
      completed: true // Always true since it's optional
    },
    {
      label: 'Ambiente de acesso',
      value: onboardingData.environmentName || 'Configurado',
      completed: !!onboardingData.environmentName
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-center"
    >
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="space-y-4"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full">
            <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground">
          🎉 Parabéns! Seu MagicPass está pronto!
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Seu sistema de controle de acesso foi configurado com sucesso. 
          Agora você pode começar a oferecer acesso inteligente e seguro!
        </p>
      </motion.div>

      {/* Completion Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-2xl mx-auto"
      >
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Configuração Concluída
            </h3>
            <div className="space-y-3">
              {completedItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-4"
      >
        <h3 className="text-xl font-semibold text-foreground">
          Próximos Passos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {nextSteps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      {step.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {step.description}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        asChild
                      >
                        <Link to={step.href} className="flex items-center gap-1">
                          {step.action}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Additional Help */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="bg-muted/30 rounded-lg p-6 max-w-2xl mx-auto"
      >
        <h4 className="font-medium mb-2">Precisa de Ajuda?</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Nossa plataforma inclui tours interativos para te guiar através de cada funcionalidade.
          Procure pelo ícone de ajuda (?) em cada página.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" size="sm">
            Central de Ajuda
          </Button>
          <Button variant="outline" size="sm">
            Tour Virtual
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}