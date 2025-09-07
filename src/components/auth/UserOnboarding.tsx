import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface UserOnboardingProps {
  userEmail: string;
  onComplete?: () => void;
}

export function UserOnboarding({ userEmail, onComplete }: UserOnboardingProps) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border rounded-xl p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Configuração de Conta</h1>
          <p className="text-sm text-muted-foreground">
            Sua conta foi criada mas precisa ser configurada por um administrador.
          </p>
        </div>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Próximos passos:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Entre em contato com seu administrador</li>
              <li>Informe seu e-mail: {userEmail}</li>
              <li>Aguarde a configuração da sua organização e função</li>
            </ol>
          </AlertDescription>
        </Alert>
        
        <p className="text-sm text-muted-foreground">
          Por segurança, contas novas precisam ser aprovadas por um administrador antes do primeiro uso.
        </p>
        
        <Button 
          onClick={onComplete} 
          variant="outline" 
          className="w-full"
          disabled={loading}
        >
          Entendi - Fazer Logout
        </Button>
      </div>
    </div>
  );
}