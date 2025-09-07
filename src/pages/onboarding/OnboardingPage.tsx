import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, userRole, organizationId } = useAuth();
  const { 
    isOnboardingActive,
    onboardingData,
    completeOnboarding 
  } = useOnboardingStore();

  useEffect(() => {
    // Auto-start onboarding for new users
    if (user && !isOnboardingActive) {
      useOnboardingStore.setState({ isOnboardingActive: true });
    }
  }, [user, isOnboardingActive]);

  const handleOnboardingComplete = async () => {
    try {
      // Ensure user profile is complete
      if (!organizationId || !userRole) {
        if (user?.email && onboardingData.userName) {
          try {
            const { error } = await supabase.rpc('setup_user_profile', {
              user_email: user.email,
              user_name: onboardingData.userName || 'Usuário',
              user_role: 'client_admin'
            });

            if (error) {
              console.error('Error setting up user profile:', error);
              toast({
                title: "Erro na configuração",
                description: "Não foi possível configurar seu perfil. Tente novamente.",
                variant: "destructive"
              });
              return;
            }
          } catch (setupError) {
            console.error('Exception setting up profile:', setupError);
            toast({
              title: "Erro na configuração",
              description: "Não foi possível configurar seu perfil. Tente novamente.",
              variant: "destructive"
            });
            return;
          }
        }
      }

      // Save organization data to Supabase
      if (onboardingData.companyName && organizationId) {
        const { error: orgError } = await supabase
          .from('organizations')
          .update({
            name: onboardingData.companyName,
            primary_color: onboardingData.primaryColor,
            secondary_color: onboardingData.secondaryColor,
            logo_url: onboardingData.logoUrl
          })
          .eq('id', organizationId);

        if (orgError) {
          console.error('Error updating organization:', orgError);
        }
      }

      // Create first access environment if configured
      if (onboardingData.environmentName && organizationId) {
        const { error: eventError } = await supabase
          .from('events')
          .insert({
            name: onboardingData.environmentName,
            organization_id: organizationId,
            start_date: onboardingData.environmentDate ? onboardingData.environmentDate + 'T09:00:00Z' : new Date().toISOString(),
            end_date: onboardingData.environmentDate ? onboardingData.environmentDate + 'T23:59:00Z' : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            capacity: parseInt(onboardingData.environmentCapacity) || 500,
            status: 'draft',
            description: `Ambiente de acesso criado durante a configuração inicial`
          });

        if (eventError) {
          console.error('Error creating first event:', eventError);
        } else {
          toast({
            title: "Evento criado!",
            description: "Seu primeiro evento foi criado e está em modo rascunho.",
          });
        }
      }

      // Complete onboarding
      completeOnboarding();
      
      toast({
        title: "Configuração concluída!",
        description: "Sua conta foi configurada com sucesso. Bem-vindo à plataforma!",
      });
      
      // Wait for state to update and then redirect
      setTimeout(() => {
        window.location.href = '/client';
      }, 500);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Erro na configuração",
        description: "Houve um problema ao salvar suas configurações. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Redirect users without proper authentication  
  if (!user) {
    navigate('/auth');
    return null;
  }

  // For users without profile, start the onboarding process
  if (!userRole || !organizationId) {
    // Auto-activate onboarding for users without proper profiles
    if (!isOnboardingActive) {
      useOnboardingStore.setState({ isOnboardingActive: true });
    }
  } else {
    // User has complete profile but onboarding is still active - redirect to dashboard
    if (!isOnboardingActive) {
      if (userRole === 'legal_admin') {
        navigate('/admin');
      } else {
        navigate('/client');
      }
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <OnboardingWizard onClose={handleOnboardingComplete} />
    </div>
  );
}