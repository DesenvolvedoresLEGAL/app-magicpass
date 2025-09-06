import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, Globe, Smartphone, Plus, Settings, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface NotificationCenterProps {
  eventId?: string;
  organizationId: string;
}

export function NotificationCenter({ eventId, organizationId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [eventId, organizationId]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(50);

      // Load webhooks
      let webhooksData = [];
      if (eventId) {
        const { data } = await supabase
          .from('webhook_configs')
          .select('*')
          .eq('event_id', eventId);
        webhooksData = data || [];
      }

      // Load email templates
      const { data: templatesData } = await supabase
        .from('email_templates')
        .select('*')
        .eq('organization_id', organizationId);

      setNotifications(notificationsData || []);
      setWebhooks(webhooksData);
      setEmailTemplates(templatesData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de notificações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async (type: 'email' | 'webhook') => {
    try {
      const { error } = await supabase.functions.invoke('send-notification', {
        body: {
          type,
          organizationId,
          eventId,
          title: 'Teste de Notificação',
          message: 'Esta é uma notificação de teste para verificar se o sistema está funcionando.',
          recipientEmail: type === 'email' ? 'teste@exemplo.com' : undefined,
          metadata: {
            test: true,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Teste Enviado",
        description: `Notificação de teste ${type} enviada com sucesso`,
      });

      loadData(); // Reload to show the new notification

    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar notificação de teste",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      'sent': 'default',
      'pending': 'secondary',
      'failed': 'destructive',
      'retrying': 'outline'
    };
    
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'webhook': return <Globe className="w-4 h-4" />;
      case 'push': return <Smartphone className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Central de Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={() => sendTestNotification('email')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Teste Email
            </Button>
            {eventId && (
              <Button 
                onClick={() => sendTestNotification('webhook')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                Teste Webhook
              </Button>
            )}
            <WebhookConfigDialog eventId={eventId} onSave={loadData} />
            <EmailTemplateDialog organizationId={organizationId} onSave={loadData} />
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma notificação encontrada
              </p>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(notification.type)}
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message.length > 100 
                          ? `${notification.message.substring(0, 100)}...`
                          : notification.message
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(notification.status)}
                    {notification.error_message && (
                      <AlertCircle 
                        className="w-4 h-4 text-destructive" 
                        data-tooltip={notification.error_message}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Webhook Configurations */}
      {eventId && (
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Webhook</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {webhooks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum webhook configurado
                </p>
              ) : (
                webhooks.map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{webhook.url}</p>
                      <p className="text-sm text-muted-foreground">
                        Eventos: {webhook.events.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={webhook.active} disabled />
                      <Badge variant={webhook.active ? 'default' : 'secondary'}>
                        {webhook.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Templates de Email</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {emailTemplates.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum template configurado
              </p>
            ) : (
              emailTemplates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-muted-foreground">{template.subject}</p>
                    <Badge variant="outline">{template.type}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={template.active} disabled />
                    <Badge variant={template.active ? 'default' : 'secondary'}>
                      {template.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Webhook Configuration Dialog
function WebhookConfigDialog({ eventId, onSave }: { eventId?: string; onSave: () => void }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>(['checkin']);
  const [secret, setSecret] = useState('');
  const { toast } = useToast();

  if (!eventId) return null;

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('webhook_configs')
        .insert({
          event_id: eventId,
          url,
          events,
          secret,
          active: true
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Webhook configurado com sucesso",
      });

      setOpen(false);
      setUrl('');
      setEvents(['checkin']);
      setSecret('');
      onSave();

    } catch (error) {
      console.error('Error saving webhook:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar webhook",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Webhook
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Webhook</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="url">URL do Webhook</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.exemplo.com/webhook"
            />
          </div>
          <div>
            <Label htmlFor="secret">Secret (Opcional)</Label>
            <Input
              id="secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="webhook_secret_key"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Email Template Dialog
function EmailTemplateDialog({ organizationId, onSave }: { organizationId: string; onSave: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('custom');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .insert({
          organization_id: organizationId,
          name,
          type,
          subject,
          html_content: content,
          active: true
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Template criado com sucesso",
      });

      setOpen(false);
      setName('');
      setType('custom');
      setSubject('');
      setContent('');
      onSave();

    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar template",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Template de Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do template"
            />
          </div>
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="registration_confirmation">Confirmação de Inscrição</SelectItem>
                <SelectItem value="checkin_confirmation">Confirmação de Check-in</SelectItem>
                <SelectItem value="reminder">Lembrete</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="subject">Assunto</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Assunto do email"
            />
          </div>
          <div>
            <Label htmlFor="content">Conteúdo HTML</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="<p>Olá {{participant_name}}, ...</p>"
              rows={6}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}