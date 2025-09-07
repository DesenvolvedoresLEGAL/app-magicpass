import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, Home, Calendar, Trophy, CalendarDays, Shield, MapPin, Clock, Users } from 'lucide-react';

interface AccessEnvironmentStepProps {
  onValidationChange: (isValid: boolean) => void;
}

const environmentTemplates = [
  { 
    value: 'corporate', 
    label: 'Edifício Corporativo', 
    icon: <Building2 className="h-4 w-4" />,
    description: 'Controle de acesso em ambientes empresariais',
    defaultCapacity: '500'
  },
  { 
    value: 'residential', 
    label: 'Área Residencial/Condomínio', 
    icon: <Home className="h-4 w-4" />,
    description: 'Acesso para moradores e visitantes',
    defaultCapacity: '1000'
  },
  { 
    value: 'event', 
    label: 'Evento Temporário', 
    icon: <Calendar className="h-4 w-4" />,
    description: 'Controle de acesso para eventos específicos',
    defaultCapacity: '200'
  },
  { 
    value: 'sports', 
    label: 'Instalação Esportiva', 
    icon: <Trophy className="h-4 w-4" />,
    description: 'Academia, clube ou arena esportiva',
    defaultCapacity: '300'
  },
  { 
    value: 'convention', 
    label: 'Centro de Convenções', 
    icon: <CalendarDays className="h-4 w-4" />,
    description: 'Feiras, congressos e grandes eventos',
    defaultCapacity: '1000'
  },
  { 
    value: 'restricted', 
    label: 'Área Restrita/Governamental', 
    icon: <Shield className="h-4 w-4" />,
    description: 'Acesso controlado de alta segurança',
    defaultCapacity: '100'
  }
];

export function AccessEnvironmentStep({ onValidationChange }: AccessEnvironmentStepProps) {
  const { onboardingData, updateOnboardingData } = useOnboardingStore();
  
  const [localData, setLocalData] = useState({
    environmentName: onboardingData.environmentName || '',
    environmentType: onboardingData.environmentType || '',
    environmentDate: onboardingData.environmentDate || '',
    environmentCapacity: onboardingData.environmentCapacity || ''
  });

  useEffect(() => {
    const isValid = localData.environmentName.trim().length > 0 && 
                   localData.environmentType.length > 0 && 
                   localData.environmentCapacity.length > 0;
    onValidationChange(isValid);
    
    if (isValid) {
      updateOnboardingData(localData);
    }
  }, [localData, onValidationChange, updateOnboardingData]);

  const handleInputChange = (field: string, value: string) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (templateValue: string) => {
    const template = environmentTemplates.find(t => t.value === templateValue);
    if (template) {
      setLocalData(prev => ({
        ...prev,
        environmentType: templateValue,
        environmentCapacity: template.defaultCapacity
      }));
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const selectedTemplate = environmentTemplates.find(t => t.value === localData.environmentType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-2xl mx-auto"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Configure seu primeiro ambiente de acesso
        </h2>
        <p className="text-muted-foreground">
          Defina onde o controle de acesso será implementado primeiro
        </p>
      </div>

      <div className="space-y-6">
        {/* Environment Template Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <Label>Tipo de Ambiente *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {environmentTemplates.map((template) => (
              <Button
                key={template.value}
                variant={localData.environmentType === template.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleTemplateSelect(template.value)}
                className="h-auto p-3 flex flex-col items-start gap-2"
              >
                <div className="flex items-center gap-2 w-full">
                  {template.icon}
                  <span className="font-medium text-sm">{template.label}</span>
                </div>
                <span className="text-xs text-muted-foreground text-left">
                  {template.description}
                </span>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Environment Name */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label htmlFor="environmentName">Nome do Ambiente *</Label>
          <Input
            id="environmentName"
            placeholder="Ex: Sede Matriz, Condomínio Residencial XYZ"
            value={localData.environmentName}
            onChange={(e) => handleInputChange('environmentName', e.target.value)}
            className="text-base"
          />
        </motion.div>

        {/* Environment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor="environmentDate">Início da Operação (opcional)</Label>
            <Input
              id="environmentDate"
              type="date"
              min={getMinDate()}
              value={localData.environmentDate}
              onChange={(e) => handleInputChange('environmentDate', e.target.value)}
              className="text-base"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <Label htmlFor="environmentCapacity">Capacidade Estimada *</Label>
            <Input
              id="environmentCapacity"
              type="number"
              min="1"
              placeholder="500"
              value={localData.environmentCapacity}
              onChange={(e) => handleInputChange('environmentCapacity', e.target.value)}
              className="text-base"
            />
          </motion.div>
        </div>
      </div>

      {/* Environment Preview */}
      {localData.environmentName && localData.environmentType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-primary/5 border border-primary/20 rounded-lg p-6"
        >
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              {selectedTemplate?.icon || <Shield className="h-6 w-6 text-primary" />}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground mb-2">
                {localData.environmentName}
              </h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                {localData.environmentDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      Início: {new Date(localData.environmentDate).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    Capacidade: {localData.environmentCapacity || '0'} pessoas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedTemplate?.description}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-primary/20">
            <div className="flex items-center gap-2 text-sm text-primary">
              <Shield className="h-4 w-4" />
              <span className="font-medium">
                Após finalizar, seu sistema de controle de acesso estará configurado!
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}