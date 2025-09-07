import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const userSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação obrigatória')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type UserFormData = z.infer<typeof userSchema>;

interface UserCreationStepProps {
  onValidationChange: (isValid: boolean) => void;
}

export function UserCreationStep({ onValidationChange }: UserCreationStepProps) {
  const { onboardingData, updateOnboardingData } = useOnboardingStore();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: onboardingData.userName || '',
      email: onboardingData.userEmail || '',
      password: '',
      confirmPassword: ''
    }
  });

  const watchedFields = form.watch();

  useEffect(() => {
    const isValid = form.formState.isValid && 
                   watchedFields.name?.length > 0 && 
                   watchedFields.email?.length > 0 &&
                   watchedFields.password?.length >= 6 &&
                   watchedFields.password === watchedFields.confirmPassword;
    
    onValidationChange(isValid);
  }, [form.formState.isValid, watchedFields, onValidationChange]);

  const handleFormChange = (data: Partial<UserFormData>) => {
    updateOnboardingData({
      userName: data.name || onboardingData.userName,
      userEmail: data.email || onboardingData.userEmail,
      userPassword: data.password || ''
    });
  };

  const handleCreateAccount = async (data: UserFormData) => {
    setIsCreating(true);
    try {
      const redirectUrl = `${window.location.origin}/onboarding`;
      
      const { error } = await signUp(data.email, data.password);

      if (error) {
        toast({
          title: 'Erro ao criar conta',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        // Save user data to onboarding store
        updateOnboardingData({
          userName: data.name,
          userEmail: data.email,
          userPassword: data.password
        });
        
        toast({
          title: 'Conta criada!',
          description: 'Verifique seu email para confirmar a conta. Você pode continuar o onboarding.',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado ao criar a conta.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-primary/10 p-3 rounded-full">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Criar sua conta</h2>
          <p className="text-muted-foreground mt-2">
            Primeiro, vamos criar sua conta no MagicPass
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados da conta</CardTitle>
          <CardDescription>
            Preencha os dados para criar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateAccount)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Seu nome completo"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleFormChange({ name: e.target.value });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="seu@email.com"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleFormChange({ email: e.target.value });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleFormChange({ password: e.target.value });
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Digite a senha novamente"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={!form.formState.isValid || isCreating}
              >
                {isCreating ? 'Criando conta...' : 'Criar conta e continuar'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="bg-muted/30 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Ao criar sua conta, você concorda com nossos <strong>Termos de Uso</strong> e <strong>Política de Privacidade</strong>
        </p>
      </div>
    </motion.div>
  );
}