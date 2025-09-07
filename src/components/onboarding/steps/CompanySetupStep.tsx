import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Users, Briefcase, GraduationCap, Heart, Music, Utensils, Palette, Home, Landmark, Hotel, CalendarDays, Shield, Trophy, HelpCircle } from 'lucide-react';

interface CompanySetupStepProps {
  onValidationChange: (isValid: boolean) => void;
}

const companyTypes = [
  { value: 'sports', label: 'Arenas Esportivas e Clubes', icon: <Trophy className="h-4 w-4" /> },
  { value: 'conventions', label: 'Centros de Convenções e Pavilhões', icon: <CalendarDays className="h-4 w-4" /> },
  { value: 'residential', label: 'Condomínios (Residenciais e Empresariais)', icon: <Home className="h-4 w-4" /> },
  { value: 'corporate', label: 'Empresas & Corporações', icon: <Building2 className="h-4 w-4" /> },
  { value: 'hospitality', label: 'Hotéis, Resorts e Parques Temáticos', icon: <Hotel className="h-4 w-4" /> },
  { value: 'events', label: 'Organizadores de Eventos, Feiras e Congressos', icon: <CalendarDays className="h-4 w-4" /> },
  { value: 'government', label: 'Órgãos Governamentais e Associações', icon: <Landmark className="h-4 w-4" /> },
  { value: 'entertainment', label: 'Promotores de Shows e Festivais', icon: <Music className="h-4 w-4" /> },
  { value: 'other', label: 'Outros', icon: <HelpCircle className="h-4 w-4" /> }
];

const accessVolumes = [
  { value: 'up-to-100', label: 'Até 100 acessos' },
  { value: '100-500', label: '100 – 500 acessos' },
  { value: '500-1000', label: '500 – 1.000 acessos' },
  { value: '1000-10000', label: '1.000 – 10.000 acessos' },
  { value: 'over-10000', label: 'Mais de 10.000 acessos' }
];

const accessGoalOptions = [
  { value: 'security', label: 'Controle de acesso seguro' },
  { value: 'experience', label: 'Experiência digital para visitantes/usuários' },
  { value: 'efficiency', label: 'Redução de filas e burocracia' },
  { value: 'analytics', label: 'Dados e relatórios em tempo real' },
  { value: 'loyalty', label: 'Programa de fidelidade e benefícios' },
  { value: 'other', label: 'Outros' }
];

export function CompanySetupStep({ onValidationChange }: CompanySetupStepProps) {
  const { onboardingData, updateOnboardingData } = useOnboardingStore();
  
  // Debug logging
  console.log('CompanySetupStep onboardingData:', onboardingData);
  
  const [localData, setLocalData] = useState({
    companyName: onboardingData.companyName || '',
    companyType: onboardingData.companyType || '',
    accessVolume: onboardingData.accessVolume || '',
    accessGoals: onboardingData.accessGoals || []
  });

  useEffect(() => {
    const isValid = localData.companyName.trim().length > 0 && 
                   localData.companyType.length > 0 && 
                   localData.accessVolume.length > 0 &&
                   (localData.accessGoals || []).length > 0;
    onValidationChange(isValid);
    
    if (isValid) {
      updateOnboardingData(localData);
    }
  }, [localData, onValidationChange, updateOnboardingData]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoalToggle = (goalValue: string) => {
    const currentGoals = localData.accessGoals || [];
    const updatedGoals = currentGoals.includes(goalValue)
      ? currentGoals.filter(g => g !== goalValue)
      : [...currentGoals, goalValue];
    handleInputChange('accessGoals', updatedGoals);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-2xl mx-auto"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Conte-nos sobre sua organização
        </h2>
        <p className="text-muted-foreground">
          Essas informações nos ajudam a personalizar sua experiência na plataforma
        </p>
      </div>

      <div className="space-y-6">
        {/* Company Name */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor="companyName">Nome da Organização *</Label>
          <Input
            id="companyName"
            placeholder="Ex: Empresa XYZ, Instituto ABC, etc."
            value={localData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            className="text-base"
          />
        </motion.div>

        {/* Company Type */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label>Tipo de Organização *</Label>
          <Select
            value={localData.companyType}
            onValueChange={(value) => handleInputChange('companyType', value)}
          >
            <SelectTrigger className="text-base">
              <SelectValue placeholder="Selecione o tipo da sua organização" />
            </SelectTrigger>
            <SelectContent>
              {companyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    {type.icon}
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Access Volume */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <Label>Quantos acessos você deseja gerenciar? *</Label>
          <Select
            value={localData.accessVolume}
            onValueChange={(value) => handleInputChange('accessVolume', value)}
          >
            <SelectTrigger className="text-base">
              <SelectValue placeholder="Selecione o volume de acessos" />
            </SelectTrigger>
            <SelectContent>
              {accessVolumes.map((volume) => (
                <SelectItem key={volume.value} value={volume.value}>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {volume.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Access Goals */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Label>O que você deseja alcançar com o MAGICPASS? *</Label>
          <p className="text-sm text-muted-foreground mb-3">Selecione todas as opções que se aplicam</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {accessGoalOptions.map((goal) => (
              <div
                key={goal.value}
                onClick={() => handleGoalToggle(goal.value)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  (localData.accessGoals || []).includes(goal.value)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-2 transition-colors ${
                    (localData.accessGoals || []).includes(goal.value)
                      ? 'border-primary bg-primary'
                      : 'border-border'
                  }`}>
                    {(localData.accessGoals || []).includes(goal.value) && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium">{goal.label}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Preview Card */}
      {localData.companyName && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-primary/5 border border-primary/20 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{localData.companyName}</h3>
              <p className="text-sm text-muted-foreground">
                {companyTypes.find(t => t.value === localData.companyType)?.label}
                {localData.accessVolume && ` • ${accessVolumes.find(v => v.value === localData.accessVolume)?.label}`}
              </p>
              {(localData.accessGoals || []).length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Objetivos: {(localData.accessGoals || []).map(g => accessGoalOptions.find(opt => opt.value === g)?.label).join(', ')}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}