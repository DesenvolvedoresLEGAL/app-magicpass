import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  organization_id: string;
};

type Organization = {
  id: string;
  name: string;
  slug: string;
};

type UserFormProps = {
  user?: User | null;
  organizations: Organization[];
  onSaved: () => void;
  onCancel: () => void;
};

const roles = [
  { value: 'legal_admin', label: 'Admin Legal', description: 'Acesso total à plataforma' },
  { value: 'client_admin', label: 'Admin Cliente', description: 'Administra sua organização' },
  { value: 'client_operator', label: 'Operador', description: 'Operações básicas de eventos' },
];

export function UserForm({ user, organizations, onSaved, onCancel }: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'client_operator',
    organization_id: '',
    active: true,
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id,
        active: user.active,
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return false;
    }

    if (!formData.email.trim()) {
      toast.error('E-mail é obrigatório');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Digite um e-mail válido');
      return false;
    }

    if (!formData.role) {
      toast.error('Selecione um role');
      return false;
    }

    if (formData.role !== 'legal_admin' && !formData.organization_id) {
      toast.error('Selecione uma organização');
      return false;
    }

    if (!user) {
      // For new users, password is required
      if (!formData.password) {
        toast.error('Senha é obrigatória');
        return false;
      }

      if (formData.password.length < 6) {
        toast.error('Senha deve ter pelo menos 6 caracteres');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Senhas não conferem');
        return false;
      }
    } else if (formData.password) {
      // For existing users, if password is provided, validate it
      if (formData.password.length < 6) {
        toast.error('Senha deve ter pelo menos 6 caracteres');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Senhas não conferem');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (user) {
        // Update existing user
        const updateData: any = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          organization_id: formData.role === 'legal_admin' ? null : formData.organization_id,
          active: formData.active,
        };

        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', user.id);

        if (error) throw error;

        // If password is provided, update it in auth.users
        if (formData.password) {
          // Note: This would typically be done via an admin API or function
          // For now, we'll show a message that password update requires manual action
          toast.warning('Atualização de senha deve ser feita pelo próprio usuário');
        }

        toast.success('Usuário atualizado com sucesso');
      } else {
        // Create new user
        // First, check if email already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', formData.email.trim())
          .single();

        if (existingUser) {
          toast.error('Este e-mail já está em uso');
          setLoading(false);
          return;
        }

        // Create auth user first
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email.trim(),
          password: formData.password,
          email_confirm: true,
        });

        if (authError) throw authError;

        // Create user in public.users table
        const { error: userError } = await supabase
          .from('users')
          .insert([{
            auth_user_id: authUser.user.id,
            name: formData.name.trim(),
            email: formData.email.trim(),
            role: formData.role,
            organization_id: formData.role === 'legal_admin' ? null : formData.organization_id,
            active: formData.active,
          }]);

        if (userError) {
          // If user creation fails, clean up auth user
          await supabase.auth.admin.deleteUser(authUser.user.id);
          throw userError;
        }

        toast.success('Usuário criado com sucesso');
      }

      onSaved();
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast.error('Erro ao salvar usuário: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find(r => r.value === formData.role);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="João Silva"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="joao@empresa.com"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role / Perfil *</Label>
        <Select value={formData.role} onValueChange={(value) => 
          setFormData(prev => ({ ...prev, role: value, organization_id: value === 'legal_admin' ? '' : prev.organization_id }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                <div>
                  <div className="font-medium">{role.label}</div>
                  <div className="text-xs text-muted-foreground">{role.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedRole && (
          <p className="text-xs text-muted-foreground">
            {selectedRole.description}
          </p>
        )}
      </div>

      {formData.role !== 'legal_admin' && (
        <div className="space-y-2">
          <Label htmlFor="organization">Organização *</Label>
          <Select value={formData.organization_id} onValueChange={(value) => 
            setFormData(prev => ({ ...prev, organization_id: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma organização" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {!user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Mínimo 6 caracteres"
              required={!user}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Confirme a senha"
              required={!user}
            />
          </div>
        </div>
      )}

      {user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha (opcional)</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Deixe vazio para manter atual"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Confirme a nova senha"
            />
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={formData.active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
        />
        <Label htmlFor="active">Usuário ativo</Label>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {user ? 'Atualizar' : 'Criar'} Usuário
        </Button>
      </div>
    </form>
  );
}