import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, Palette, Eye, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function Branding() {
  const { toast } = useToast();
  const { organizationId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  const [branding, setBranding] = useState({
    name: '',
    logo_url: '',
    primary_color: '#020cbc',
    secondary_color: '#4d2bfb'
  });

  useEffect(() => {
    if (organizationId) {
      loadBranding();
    }
  }, [organizationId]);

  const loadBranding = async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('name, logo_url, primary_color, secondary_color')
        .eq('id', organizationId)
        .single();

      if (error) throw error;
      
      if (data) {
        setBranding({
          name: data.name || '',
          logo_url: data.logo_url || '',
          primary_color: data.primary_color || '#020cbc',
          secondary_color: data.secondary_color || '#4d2bfb'
        });
        setLogoPreview(data.logo_url || '');
      }
    } catch (error) {
      console.error('Error loading branding:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações de marca",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !organizationId) return null;

    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${organizationId}/logo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('participant-photos')
      .upload(fileName, logoFile, { upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('participant-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const saveBranding = async () => {
    if (!organizationId) return;
    
    setSaving(true);
    try {
      let logoUrl = branding.logo_url;
      
      if (logoFile) {
        logoUrl = await uploadLogo() || logoUrl;
      }

      const { error } = await supabase
        .from('organizations')
        .update({
          name: branding.name,
          logo_url: logoUrl,
          primary_color: branding.primary_color,
          secondary_color: branding.secondary_color
        })
        .eq('id', organizationId);

      if (error) throw error;

      setBranding(prev => ({ ...prev, logo_url: logoUrl }));
      setLogoFile(null);
      
      toast({
        title: "Sucesso",
        description: "Configurações de marca salvas com sucesso",
      });
    } catch (error) {
      console.error('Error saving branding:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações de marca",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Personalização da Marca</h1>
        <p className="text-muted-foreground">
          Configure a identidade visual da sua organização
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Organization Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Informações da Organização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="orgName">Nome da Organização</Label>
                <Input
                  id="orgName"
                  value={branding.name}
                  onChange={(e) => setBranding(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome da organização"
                />
              </div>
            </CardContent>
          </Card>

          {/* Logo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Logo da Organização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Clique para fazer upload</span> do logo
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG até 5MB</p>
                  </div>
                  <input 
                    id="logo-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </label>
              </div>
              
              {logoPreview && (
                <div className="flex justify-center">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="max-w-32 max-h-32 object-contain rounded-lg border border-border"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Color Scheme */}
          <Card>
            <CardHeader>
              <CardTitle>Esquema de Cores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Cor Primária</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={branding.primary_color}
                      onChange={(e) => setBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={branding.primary_color}
                      onChange={(e) => setBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="secondaryColor">Cor Secundária</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={branding.secondary_color}
                      onChange={(e) => setBranding(prev => ({ ...prev, secondary_color: e.target.value }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={branding.secondary_color}
                      onChange={(e) => setBranding(prev => ({ ...prev, secondary_color: e.target.value }))}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            onClick={saveBranding}
            disabled={saving}
            className="w-full"
            size="lg"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview da Marca
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Header Preview */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Header do Portal Público</h3>
                <div 
                  className="flex items-center gap-3 p-4 rounded-lg"
                  style={{ backgroundColor: branding.primary_color + '10' }}
                >
                  {logoPreview && (
                    <img 
                      src={logoPreview} 
                      alt="Logo" 
                      className="w-10 h-10 object-contain rounded"
                    />
                  )}
                  <div>
                    <h2 
                      className="text-lg font-bold"
                      style={{ color: branding.primary_color }}
                    >
                      {branding.name || 'Nome da Organização'}
                    </h2>
                    <p className="text-sm text-muted-foreground">Portal de Inscrições</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Button Preview */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Botões</h3>
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    style={{ 
                      backgroundColor: branding.primary_color,
                      borderColor: branding.primary_color 
                    }}
                  >
                    Botão Primário
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    style={{ 
                      borderColor: branding.secondary_color,
                      color: branding.secondary_color 
                    }}
                  >
                    Botão Secundário
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Badge Preview */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <div className="flex gap-2 flex-wrap">
                  <Badge 
                    style={{ 
                      backgroundColor: branding.primary_color + '20',
                      color: branding.primary_color,
                      borderColor: branding.primary_color + '40'
                    }}
                  >
                    Confirmado
                  </Badge>
                  <Badge 
                    style={{ 
                      backgroundColor: branding.secondary_color + '20',
                      color: branding.secondary_color,
                      borderColor: branding.secondary_color + '40'
                    }}
                  >
                    Check-in
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}