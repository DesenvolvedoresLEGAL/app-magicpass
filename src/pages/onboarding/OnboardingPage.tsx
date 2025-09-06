import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, organizationId } = useAuth();
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

      // Create first event if configured
      if (onboardingData.eventName && organizationId) {
        const { error: eventError } = await supabase
          .from('events')
          .insert({
            name: onboardingData.eventName,
            organization_id: organizationId,
            start_date: onboardingData.eventDate + 'T09:00:00Z',
            end_date: onboardingData.eventDate + 'T18:00:00Z',
            capacity: parseInt(onboardingData.eventCapacity) || 100,
            status: 'draft',
            description: `Evento criado durante a configuração inicial`
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
      
      // Redirect to dashboard
      navigate('/client/dashboard');
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Erro na configuração",
        description: "Houve um problema ao salvar suas configurações. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!isOnboardingActive) {
    navigate('/client/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <OnboardingWizard onClose={handleOnboardingComplete} />
    </div>
  );
}