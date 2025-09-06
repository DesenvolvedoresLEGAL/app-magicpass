import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Database, 
  Webhook, 
  Globe, 
  Users, 
  Shield,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function Configuracoes() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Configurações
        </h1>
        <p className="text-muted-foreground">
          Gerencie integrações e configurações do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supabase Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Integração Supabase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-success/20 bg-success/5">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <div>
                  <p className="font-medium">Conectado</p>
                  <p className="text-sm text-muted-foreground">
                    Autenticação e banco de dados ativos
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-success border-success">
                Ativo
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <Label>URL do Projeto</Label>
                <Input 
                  value="https://projeto.supabase.co" 
                  disabled 
                  className="font-mono text-sm"
                />
              </div>
              
              <div>
                <Label>Região</Label>
                <Input 
                  value="São Paulo (sa-east-1)" 
                  disabled 
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir Console
              </Button>
              <Button variant="outline" size="sm">
                Reconfigurar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5" />
              Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure webhooks para receber notificações de check-ins em tempo real.
            </p>

            <div className="space-y-3">
              <div>
                <Label>URL do Webhook</Label>
                <Input 
                  placeholder="https://api.exemplo.com/webhook"
                  className="font-mono text-sm"
                />
              </div>
              
              <div>
                <Label>Secret Key</Label>
                <Input 
                  type="password"
                  placeholder="webhook_secret_123"
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg border border-warning/20 bg-warning/5">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-warning" />
                <div>
                  <p className="font-medium text-warning">Não configurado</p>
                  <p className="text-sm text-muted-foreground">
                    Configure para receber notificações de check-ins
                  </p>
                </div>
              </div>
            </div>

            <Button className="w-full">
              Salvar Webhook
            </Button>
          </CardContent>
        </Card>

        {/* Custom Domain */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Domínio Personalizado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure um domínio personalizado para o seu painel de credenciamento.
            </p>

            <div className="space-y-3">
              <div>
                <Label>Domínio Atual</Label>
                <Input 
                  value="magicpass.lovableproject.com" 
                  disabled 
                  className="font-mono text-sm"
                />
              </div>
              
              <div>
                <Label>Novo Domínio</Label>
                <Input 
                  placeholder="credenciamento.seudominio.com"
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <p className="font-medium mb-2">Instruções DNS:</p>
              <p>1. Adicione um registro CNAME apontando para:</p>
              <code className="block font-mono text-xs bg-background p-2 rounded mt-1">
                magicpass.lovableproject.com
              </code>
            </div>

            <Button variant="outline" className="w-full">
              Configurar Domínio
            </Button>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Permissões e Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Gerencie permissões de usuários e controle de acesso.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Administrador</p>
                  <p className="text-sm text-muted-foreground">
                    Acesso total ao sistema
                  </p>
                </div>
                <Badge>Admin</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Operador</p>
                  <p className="text-sm text-muted-foreground">
                    Credenciamento e relatórios
                  </p>
                </div>
                <Badge variant="secondary">Operador</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Visualizador</p>
                  <p className="text-sm text-muted-foreground">
                    Apenas visualização
                  </p>
                </div>
                <Badge variant="outline">Viewer</Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Convitar Usuário</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="email@exemplo.com"
                  className="flex-1"
                />
                <Button variant="outline">
                  Enviar Convite
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">v2.1.0</p>
                <p className="text-sm text-muted-foreground">Versão do Sistema</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-success">99.9%</p>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">1,247</p>
                <p className="text-sm text-muted-foreground">Check-ins Totais</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">15ms</p>
                <p className="text-sm text-muted-foreground">Latência Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}