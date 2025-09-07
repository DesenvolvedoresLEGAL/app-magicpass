import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { UserCreationStep } from './steps/UserCreationStep';
import { WelcomeStep } from './steps/WelcomeStep';
import { CompanySetupStep } from './steps/CompanySetupStep';
import { BrandingStep } from './steps/BrandingStep';
import { TeamStep } from './steps/TeamStep';
import { AccessEnvironmentStep } from './steps/AccessEnvironmentStep';
import { SuccessStep } from './steps/SuccessStep';
import { useAuth } from '@/hooks/useAuth';
import confetti from 'canvas-confetti';

const steps = [
  { id: 'user', component: UserCreationStep, title: 'Criar Conta' },
  { id: 'welcome', component: WelcomeStep, title: 'Bem-vindo!' },
  { id: 'company', component: CompanySetupStep, title: 'Sua Organização' },
  { id: 'branding', component: BrandingStep, title: 'Identidade Visual' },
  { id: 'team', component: TeamStep, title: 'Sua Equipe' },
  { id: 'environment', component: AccessEnvironmentStep, title: 'Ambiente de Acesso' },
  { id: 'success', component: SuccessStep, title: 'Tudo Pronto!' }
];

interface OnboardingWizardProps {
  onClose?: () => void;
}

export function OnboardingWizard({ onClose }: OnboardingWizardProps) {
  const { 
    currentStep, 
    totalSteps, 
    isOnboardingActive,
    nextStep, 
    prevStep, 
    completeOnboarding,
    onboardingData 
  } = useOnboardingStore();
  
  const [isValid, setIsValid] = useState(false);
  const { organizationId } = useAuth();

  const progress = ((currentStep + 1) / totalSteps) * 100;
  const CurrentStepComponent = steps[currentStep]?.component;

  useEffect(() => {
    if (currentStep === totalSteps - 1) {
      // Trigger confetti on success step
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [currentStep, totalSteps]);

  const handleNext = () => {
    if (currentStep === totalSteps - 1) {
      completeOnboarding();
      onClose?.();
    } else {
      nextStep();
    }
  };

  const handleClose = () => {
    completeOnboarding();
    onClose?.();
  };

  if (!isOnboardingActive) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="border-b p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Configuração Inicial</h2>
            </div>
            <div className="text-sm text-muted-foreground">
              {steps[currentStep]?.title}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Etapa {currentStep + 1} de {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% completo
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 min-h-full flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                {CurrentStepComponent && (
                  <CurrentStepComponent onValidationChange={setIsValid} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <div className="flex items-center gap-2">
            {currentStep < totalSteps - 2 && (
              <Button
                variant="ghost"
                onClick={() => {
                  completeOnboarding();
                  onClose?.();
                }}
                className="text-muted-foreground"
              >
                Pular configuração
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={!isValid && currentStep !== 0 && currentStep !== totalSteps - 1}
              className="flex items-center gap-2"
            >
              {currentStep === totalSteps - 1 ? (
                'Finalizar'
              ) : (
                <>
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}