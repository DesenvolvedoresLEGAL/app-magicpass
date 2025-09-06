import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, Image, Palette, Eye } from 'lucide-react';

interface BrandingStepProps {
  onValidationChange: (isValid: boolean) => void;
}

const colorPresets = [
  { name: 'Azul', primary: '#3b82f6', secondary: '#1e40af' },
  { name: 'Verde', primary: '#10b981', secondary: '#059669' },
  { name: 'Roxo', primary: '#8b5cf6', secondary: '#7c3aed' },
  { name: 'Rosa', primary: '#ec4899', secondary: '#db2777' },
  { name: 'Laranja', primary: '#f97316', secondary: '#ea580c' },
  { name: 'Vermelho', primary: '#ef4444', secondary: '#dc2626' },
];

export function BrandingStep({ onValidationChange }: BrandingStepProps) {
  const { onboardingData, updateOnboardingData } = useOnboardingStore();
  const [logoPreview, setLogoPreview] = useState<string>(onboardingData.logoUrl);
  const [localData, setLocalData] = useState({
    primaryColor: onboardingData.primaryColor || '#3b82f6',
    secondaryColor: onboardingData.secondaryColor || '#1e40af',
  });

  useEffect(() => {
    // This step is always valid (branding is optional)
    onValidationChange(true);
    updateOnboardingData(localData);
  }, [localData, onValidationChange, updateOnboardingData]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      updateOnboardingData({ logoFile: file, logoUrl: url });
    }
  }, [updateOnboardingData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleColorChange = (type: 'primary' | 'secondary', color: string) => {
    setLocalData(prev => ({ ...prev, [`${type}Color`]: color }));
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setLocalData({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Personalize sua identidade visual
        </h2>
        <p className="text-muted-foreground">
          Adicione seu logo e escolha as cores que representam sua marca
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <Label>Logo da Empresa (Opcional)</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              {logoPreview ? (
                <div className="space-y-2">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="mx-auto h-16 w-16 object-contain"
                  />
                  <p className="text-sm text-muted-foreground">
                    Clique ou arraste para alterar
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Clique ou arraste seu logo aqui
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG ou SVG até 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Color Presets */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <Label>Paletas de Cores Predefinidas</Label>
            <div className="grid grid-cols-3 gap-2">
              {colorPresets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => applyColorPreset(preset)}
                  className="flex items-center gap-2 h-12"
                >
                  <div className="flex gap-1">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  <span className="text-xs">{preset.name}</span>
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Custom Colors */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <Label>Cores Personalizadas</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Cor Primária</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={localData.primaryColor}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={localData.primaryColor}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Cor Secundária</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={localData.secondaryColor}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={localData.secondaryColor}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    placeholder="#1e40af"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <Label>Preview da Identidade</Label>
          </div>
          
          <div className="border rounded-lg p-6 bg-card space-y-4">
            {/* Header Preview */}
            <div 
              className="rounded-lg p-4 text-white"
              style={{ backgroundColor: localData.primaryColor }}
            >
              <div className="flex items-center gap-3">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-8 w-8 object-contain bg-white/10 rounded p-1"
                  />
                ) : (
                  <div className="h-8 w-8 bg-white/20 rounded flex items-center justify-center">
                    <Image className="h-4 w-4" />
                  </div>
                )}
                <span className="font-semibold">
                  {onboardingData.companyName || 'Sua Empresa'}
                </span>
              </div>
            </div>

            {/* Button Preview */}
            <div className="space-y-2">
              <Button 
                style={{ backgroundColor: localData.primaryColor }}
                className="w-full text-white"
              >
                Botão Primário
              </Button>
              <Button 
                variant="outline"
                style={{ 
                  borderColor: localData.secondaryColor,
                  color: localData.secondaryColor 
                }}
                className="w-full"
              >
                Botão Secundário
              </Button>
            </div>

            {/* Badge Preview */}
            <div className="flex gap-2">
              <div 
                className="px-3 py-1 rounded-full text-white text-sm"
                style={{ backgroundColor: localData.primaryColor }}
              >
                Tag Primária
              </div>
              <div 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: `${localData.secondaryColor}20`,
                  color: localData.secondaryColor,
                  border: `1px solid ${localData.secondaryColor}40`
                }}
              >
                Tag Secundária
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}