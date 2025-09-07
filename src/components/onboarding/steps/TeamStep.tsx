import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, X, Users, UserPlus } from 'lucide-react';

interface TeamStepProps {
  onValidationChange: (isValid: boolean) => void;
}

export function TeamStep({ onValidationChange }: TeamStepProps) {
  const { onboardingData, updateOnboardingData } = useOnboardingStore();
  const [emailInput, setEmailInput] = useState('');
  const [teamEmails, setTeamEmails] = useState<string[]>(onboardingData.teamEmails || []);

  useEffect(() => {
    // This step is always valid (team invitation is optional)
    onValidationChange(true);
    updateOnboardingData({ teamEmails });
  }, [teamEmails, onValidationChange, updateOnboardingData]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (email && isValidEmail(email) && !teamEmails.includes(email)) {
      setTeamEmails(prev => [...prev, email]);
      setEmailInput('');
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setTeamEmails(prev => prev.filter(email => email !== emailToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmail();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-2xl mx-auto"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Convide sua equipe
        </h2>
        <p className="text-muted-foreground">
          Adicione membros da sua equipe para colaborar na gestão de acessos
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor="teamEmail">Adicionar Membro da Equipe</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                id="teamEmail"
                type="email"
                placeholder="email@exemplo.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-base"
              />
            </div>
            <Button
              onClick={addEmail}
              disabled={!emailInput || !isValidEmail(emailInput)}
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {emailInput && !isValidEmail(emailInput) && (
            <p className="text-sm text-destructive">
              Por favor, insira um email válido
            </p>
          )}
        </motion.div>

        {/* Team Members List */}
        {teamEmails.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <Label>Membros Convidados ({teamEmails.length})</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {teamEmails.map((email, index) => (
                <motion.div
                  key={email}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-1.5 rounded">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{email}</span>
                    <Badge variant="secondary" className="text-xs">
                      Pendente
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEmail(email)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Skip Option */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <UserPlus className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Configuração Opcional
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Você pode convidar membros da equipe agora ou fazer isso mais tarde 
              através das configurações da conta.
            </p>
          </div>
        </motion.div>

        {/* Team Benefits */}
        {teamEmails.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Colaboração</h3>
                  <p className="text-xs text-muted-foreground">
                    Trabalhe em equipe na gestão de acessos e controle
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Notificações</h3>
                  <p className="text-xs text-muted-foreground">
                    Receba alertas sobre acessos e atividades de segurança
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}