import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Users, MapPin, Clock, Zap, Coffee, GraduationCap, Music, Briefcase } from 'lucide-react';

interface FirstEventStepProps {
  onValidationChange: (isValid: boolean) => void;
}

const eventTemplates = [
  { 
    value: 'conference', 
    label: 'Conferência', 
    icon: <Briefcase className="h-4 w-4" />,
    description: 'Evento corporativo ou profissional',
    defaultCapacity: '200'
  },
  { 
    value: 'workshop', 
    label: 'Workshop', 
    icon: <GraduationCap className="h-4 w-4" />,
    description: 'Sessão de aprendizado prático',
    defaultCapacity: '50'
  },
  { 
    value: 'meetup', 
    label: 'Meetup', 
    icon: <Coffee className="h-4 w-4" />,
    description: 'Encontro informal da comunidade',
    defaultCapacity: '100'
  },
  { 
    value: 'concert', 
    label: 'Show/Concerto', 
    icon: <Music className="h-4 w-4" />,
    description: 'Evento de entretenimento',
    defaultCapacity: '500'
  },
  { 
    value: 'seminar', 
    label: 'Seminário', 
    icon: <Users className="h-4 w-4" />,
    description: 'Apresentação educacional',
    defaultCapacity: '150'
  },
  { 
    value: 'networking', 
    label: 'Networking', 
    icon: <Zap className="h-4 w-4" />,
    description: 'Evento de conexões profissionais',
    defaultCapacity: '80'
  }
];

export function FirstEventStep({ onValidationChange }: FirstEventStepProps) {
  const { onboardingData, updateOnboardingData } = useOnboardingStore();
  const [localData, setLocalData] = useState({
    eventName: onboardingData.eventName,
    eventType: onboardingData.eventType,
    eventDate: onboardingData.eventDate,
    eventCapacity: onboardingData.eventCapacity
  });

  useEffect(() => {
    const isValid = localData.eventName.trim().length > 0 && 
                   localData.eventType.length > 0 && 
                   localData.eventDate.length > 0 && 
                   localData.eventCapacity.length > 0;
    onValidationChange(isValid);
    
    if (isValid) {
      updateOnboardingData(localData);
    }
  }, [localData, onValidationChange, updateOnboardingData]);

  const handleInputChange = (field: string, value: string) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (templateValue: string) => {
    const template = eventTemplates.find(t => t.value === templateValue);
    if (template) {
      setLocalData(prev => ({
        ...prev,
        eventType: templateValue,
        eventCapacity: template.defaultCapacity
      }));
    }
  };

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Tomorrow
    return today.toISOString().split('T')[0];
  };

  const selectedTemplate = eventTemplates.find(t => t.value === localData.eventType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-2xl mx-auto"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Vamos criar seu primeiro evento
        </h2>
        <p className="text-muted-foreground">
          Configure os dados básicos do seu evento para começar a receber inscrições
        </p>
      </div>

      <div className="space-y-6">
        {/* Event Template Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <Label>Tipo de Evento *</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {eventTemplates.map((template) => (
              <Button
                key={template.value}
                variant={localData.eventType === template.value ? "default" : "outline"}
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

        {/* Event Name */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label htmlFor="eventName">Nome do Evento *</Label>
          <Input
            id="eventName"
            placeholder="Ex: Conferência de Tecnologia 2024"
            value={localData.eventName}
            onChange={(e) => handleInputChange('eventName', e.target.value)}
            className="text-base"
          />
        </motion.div>

        {/* Event Date and Capacity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor="eventDate">Data do Evento *</Label>
            <Input
              id="eventDate"
              type="date"
              min={getMinDate()}
              value={localData.eventDate}
              onChange={(e) => handleInputChange('eventDate', e.target.value)}
              className="text-base"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <Label htmlFor="eventCapacity">Capacidade *</Label>
            <Input
              id="eventCapacity"
              type="number"
              min="1"
              placeholder="100"
              value={localData.eventCapacity}
              onChange={(e) => handleInputChange('eventCapacity', e.target.value)}
              className="text-base"
            />
          </motion.div>
        </div>
      </div>

      {/* Event Preview */}
      {localData.eventName && localData.eventType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-primary/5 border border-primary/20 rounded-lg p-6"
        >
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              {selectedTemplate?.icon || <Calendar className="h-6 w-6 text-primary" />}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground mb-2">
                {localData.eventName}
              </h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {localData.eventDate 
                      ? new Date(localData.eventDate).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Data a definir'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    Capacidade: {localData.eventCapacity || '0'} participantes
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
              <Zap className="h-4 w-4" />
              <span className="font-medium">
                Após finalizar, sua página de inscrições estará pronta!
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}