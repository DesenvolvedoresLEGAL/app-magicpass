import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app'; // ✅ para tratar erros do Firebase

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, userRole, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userRole) {
      if (userRole === 'legal_admin') {
        navigate('/admin', { replace: true });
      } else if (['client_admin', 'client_operator'].includes(userRole)) {
        navigate('/client', { replace: true });
      }
    }
  }, [user, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        const translatedMessage = translateFirebaseError(error.code);

        toast({
          title: 'Alerta',
          description: translatedMessage,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      const fallbackMessage = error instanceof FirebaseError
        ? translateFirebaseError(error.code)
        : 'Ocorreu um erro inesperado. Tente novamente mais tarde.';

      toast({
        title: 'Erro inesperado',
        description: fallbackMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">MagicPass</CardTitle>
          <CardDescription>
            Entre em sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Carregando...' : 'Entrar'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={handleCreateAccount}
              className="text-sm"
            >
              Não tem conta? Criar uma
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ✅ Função auxiliar para traduzir os erros do Firebase Auth
function translateFirebaseError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'O email informado é inválido.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada.';
    case 'auth/user-not-found':
      return 'Usuário não encontrado. Verifique seu email.';
    case 'auth/wrong-password':
      return 'Senha incorreta. Tente novamente.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verifique sua internet.';
    case 'auth/internal-error':
      return 'Erro interno. Tente novamente.';
    default:
      return 'Usuário sem Cadastro.';
  }
}
