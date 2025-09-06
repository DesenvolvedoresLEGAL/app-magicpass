import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserForm } from '@/components/admin/UserForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from 'sonner';
import { Users, Plus, Search, Settings, Shield, Building2, UserCheck, UserX } from 'lucide-react';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  organization_id: string;
  created_at: string;
  organization?: {
    name: string;
    slug: string;
  };
};

type Organization = {
  id: string;
  name: string;
  slug: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [orgFilter, setOrgFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          organization:organizations(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .order('name');

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchOrganizations();
  }, []);

  const handleCreateUser = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleUserSaved = () => {
    setDialogOpen(false);
    setEditingUser(null);
    fetchUsers();
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success(`Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Erro ao alterar status do usuário');
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      legal_admin: { label: 'Admin Legal', variant: 'destructive' as const },
      client_admin: { label: 'Admin Cliente', variant: 'default' as const },
      client_operator: { label: 'Operador', variant: 'secondary' as const },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || { 
      label: role, 
      variant: 'outline' as const 
    };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.organization?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesOrg = orgFilter === 'all' || user.organization_id === orgFilter;

    return matchesSearch && matchesRole && matchesOrg;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6" />
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          </div>
          <p className="text-muted-foreground">
            Gerencie todos os usuários da plataforma
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateUser}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
            </DialogHeader>
            <UserForm 
              user={editingUser} 
              organizations={organizations}
              onSaved={handleUserSaved}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os roles</SelectItem>
                <SelectItem value="legal_admin">Admin Legal</SelectItem>
                <SelectItem value="client_admin">Admin Cliente</SelectItem>
                <SelectItem value="client_operator">Operador</SelectItem>
              </SelectContent>
            </Select>

            <Select value={orgFilter} onValueChange={setOrgFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por organização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas organizações</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setRoleFilter('all');
              setOrgFilter('all');
            }}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="Nenhum usuário encontrado"
          description={searchTerm || roleFilter !== 'all' || orgFilter !== 'all' 
            ? "Nenhum usuário corresponde aos critérios de busca." 
            : "Comece criando seu primeiro usuário."
          }
          action={searchTerm || roleFilter !== 'all' || orgFilter !== 'all' ? undefined : {
            label: "Novo Usuário",
            onClick: handleCreateUser
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredUsers.length} usuário{filteredUsers.length === 1 ? '' : 's'}
            </CardTitle>
            <CardDescription>
              Lista de todos os usuários cadastrados na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Organização</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="w-32">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{user.organization?.name || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.active ? (
                            <>
                              <UserCheck className="h-4 w-4 text-success" />
                              <span className="text-sm text-success">Ativo</span>
                            </>
                          ) : (
                            <>
                              <UserX className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Inativo</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id, user.active)}
                          >
                            {user.active ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}