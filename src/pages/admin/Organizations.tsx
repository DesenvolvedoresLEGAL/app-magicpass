import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OrganizationForm } from '@/components/admin/OrganizationForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from 'sonner';
import { Building2, Plus, Search, Users, Calendar, Settings } from 'lucide-react';

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  created_at: string;
  updated_at: string;
  _count?: {
    users: number;
    events: number;
  };
};

export default function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          users:users(count),
          events:events(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include counts
      const transformedData = data?.map(org => ({
        ...org,
        _count: {
          users: org.users?.length || 0,
          events: org.events?.length || 0,
        }
      })) || [];

      setOrganizations(transformedData);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Erro ao carregar organizações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleCreateOrg = () => {
    setEditingOrg(null);
    setDialogOpen(true);
  };

  const handleEditOrg = (org: Organization) => {
    setEditingOrg(org);
    setDialogOpen(true);
  };

  const handleOrgSaved = () => {
    setDialogOpen(false);
    setEditingOrg(null);
    fetchOrganizations();
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6" />
          <h1 className="text-3xl font-bold tracking-tight">Organizações</h1>
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
            <Building2 className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Organizações</h1>
          </div>
          <p className="text-muted-foreground">
            Gerencie as organizações clientes da plataforma
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateOrg}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Organização
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingOrg ? 'Editar Organização' : 'Nova Organização'}
              </DialogTitle>
            </DialogHeader>
            <OrganizationForm 
              organization={editingOrg} 
              onSaved={handleOrgSaved}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar organizações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Organizations List */}
      {filteredOrganizations.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-12 w-12" />}
          title="Nenhuma organização encontrada"
          description={searchTerm ? "Nenhuma organização corresponde aos critérios de busca." : "Comece criando sua primeira organização cliente."}
          action={searchTerm ? undefined : {
            label: "Nova Organização",
            onClick: handleCreateOrg
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredOrganizations.length} organizaç{filteredOrganizations.length === 1 ? 'ão' : 'ões'}
            </CardTitle>
            <CardDescription>
              Lista de todas as organizações cadastradas na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organização</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Usuários</TableHead>
                    <TableHead>Eventos</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrganizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                            style={{ backgroundColor: org.primary_color }}
                          >
                            {org.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{org.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: org.primary_color }}
                              />
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: org.secondary_color }}
                              />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{org.slug}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{org._count?.users || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{org._count?.events || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(org.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditOrg(org)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
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