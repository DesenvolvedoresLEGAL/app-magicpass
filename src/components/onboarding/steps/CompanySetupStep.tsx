import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Users, Briefcase, GraduationCap, Heart, Music, Utensils, Palette } from 'lucide-react';

interface CompanySetupStepProps {
  onValidationChange: (isValid: boolean) => void;
}

const companyTypes = [
  { value: 'corporate', label: 'Empresarial', icon: <Building2 className="h-4 w-4" /> },
  { value: 'education', label: 'Educacional', icon: <GraduationCap className="h-4 w-4" /> },
  { value: 'nonprofit', label: 'Sem fins lucrativos', icon: <Heart className="h-4 w-4" /> },
  { value: 'entertainment', label: 'Entretenimento', icon: <Music className="h-4 w-4" /> },
  { value: 'food', label: 'Alimentação', icon: <Utensils className="h-4 w-4" /> },
  { value: 'consulting', label: 'Consultoria', icon: <Briefcase className="h-4 w-4" /> },
  { value: 'agency', label: 'Agência', icon: <Palette className="h-4 w-4" /> },
  { value: 'other', label: 'Outro', icon: <Building2 className="h-4 w-4" /> }
];

const teamSizes = [
  { value: '1', label: 'Apenas eu' },
  { value: '2-5', label: '2-5 pessoas' },
  { value: '6-20', label: '6-20 pessoas' },
  { value: '21-50', label: '21-50 pessoas' },
  { value: '51-200', label: '51-200 pessoas' },
  { value: '200+', label: 'Mais de 200 pessoas' }
];

export function CompanySetupStep({ onValidationChange }: CompanySetupStepProps) {
  const { onboardingData, updateOnboardingData } = useOnboardingStore();
  const [localData, setLocalData] = useState({
    companyName: onboardingData.companyName,
    companyType: onboardingData.companyType,
    teamSize: onboardingData.teamSize
  });

  useEffect(() => {
    const isValid = localData.companyName.trim().length > 0 && 
                   localData.companyType.length > 0 && 
                   localData.teamSize.length > 0;
    onValidationChange(isValid);
    
    if (isValid) {
      updateOnboardingData(localData);
    }
  }, [localData, onValidationChange, updateOnboardingData]);

  const handleInputChange = (field: string, value: string) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
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

        {/* Team Size */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <Label>Tamanho da Equipe *</Label>
          <Select
            value={localData.teamSize}
            onValueChange={(value) => handleInputChange('teamSize', value)}
          >
            <SelectTrigger className="text-base">
              <SelectValue placeholder="Quantas pessoas trabalham na organização?" />
            </SelectTrigger>
            <SelectContent>
              {teamSizes.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {size.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                {localData.teamSize && ` • ${teamSizes.find(s => s.value === localData.teamSize)?.label}`}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}