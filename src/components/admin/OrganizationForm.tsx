import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
};

type OrganizationFormProps = {
  organization?: Organization | null;
  onSaved: () => void;
  onCancel: () => void;
};

export function OrganizationForm({ organization, onSaved, onCancel }: OrganizationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo_url: '',
    primary_color: '#3b82f6',
    secondary_color: '#1e40af',
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        slug: organization.slug,
        logo_url: organization.logo_url || '',
        primary_color: organization.primary_color,
        secondary_color: organization.secondary_color,
      });
    }
  }, [organization]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: !organization ? generateSlug(value) : prev.slug // Only auto-generate for new orgs
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Nome da organização é obrigatório');
      return false;
    }

    if (!formData.slug.trim()) {
      toast.error('Slug é obrigatório');
      return false;
    }

    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      toast.error('Slug deve conter apenas letras minúsculas, números e hífens');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (organization) {
        // Update existing organization
        const { error } = await supabase
          .from('organizations')
          .update({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            logo_url: formData.logo_url.trim() || null,
            primary_color: formData.primary_color,
            secondary_color: formData.secondary_color,
          })
          .eq('id', organization.id);

        if (error) throw error;
        toast.success('Organização atualizada com sucesso');
      } else {
        // Check if slug already exists
        const { data: existingOrg } = await supabase
          .from('organizations')
          .select('id')
          .eq('slug', formData.slug.trim())
          .single();

        if (existingOrg) {
          toast.error('Este slug já está em uso');
          setLoading(false);
          return;
        }

        // Create new organization
        const { error } = await supabase
          .from('organizations')
          .insert([{
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            logo_url: formData.logo_url.trim() || null,
            primary_color: formData.primary_color,
            secondary_color: formData.secondary_color,
          }]);

        if (error) throw error;
        toast.success('Organização criada com sucesso');
      }

      onSaved();
    } catch (error: any) {
      console.error('Error saving organization:', error);
      toast.error('Erro ao salvar organização: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Organização *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Ex: Minha Empresa Ltda"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug (identificador único) *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            placeholder="Ex: minha-empresa"
            pattern="^[a-z0-9-]+$"
            title="Apenas letras minúsculas, números e hífens"
            required
          />
          <p className="text-xs text-muted-foreground">
            Usado em URLs e identificação única. Apenas letras minúsculas, números e hífens.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo_url">URL do Logo (opcional)</Label>
        <Input
          id="logo_url"
          type="url"
          value={formData.logo_url}
          onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
          placeholder="https://exemplo.com/logo.png"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="primary_color">Cor Primária</Label>
          <div className="flex items-center gap-2">
            <input
              id="primary_color"
              type="color"
              value={formData.primary_color}
              onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
              className="w-12 h-10 border border-input rounded cursor-pointer"
            />
            <Input
              value={formData.primary_color}
              onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
              placeholder="#3b82f6"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondary_color">Cor Secundária</Label>
          <div className="flex items-center gap-2">
            <input
              id="secondary_color"
              type="color"
              value={formData.secondary_color}
              onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
              className="w-12 h-10 border border-input rounded cursor-pointer"
            />
            <Input
              value={formData.secondary_color}
              onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
              placeholder="#1e40af"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 border rounded-lg bg-muted">
        <p className="text-sm font-medium mb-2">Preview das cores:</p>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded"
            style={{ backgroundColor: formData.primary_color }}
          />
          <div
            className="w-8 h-8 rounded"
            style={{ backgroundColor: formData.secondary_color }}
          />
          <span className="text-sm text-muted-foreground">
            Cores que serão usadas na identidade visual da organização
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {organization ? 'Atualizar' : 'Criar'} Organização
        </Button>
      </div>
    </form>
  );
}