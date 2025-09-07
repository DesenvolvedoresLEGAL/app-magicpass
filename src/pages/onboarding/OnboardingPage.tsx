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
      // If user doesn't have an organization, they need proper account setup
      if (!organizationId || !userRole) {
        toast({
          title: "Configuração pendente",
          description: "Sua conta precisa ser configurada por um administrador antes de continuar.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
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
      
      // Redirect based on user role
      if (userRole === 'legal_admin') {
        navigate('/admin');
      } else {
        navigate('/client');
      }
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Erro na configuração",
        description: "Houve um problema ao salvar suas configurações. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Debug: Log current state
  console.log('OnboardingPage - Debug State:', {
    user: !!user,
    userRole,
    organizationId,
    isOnboardingActive,
    currentPath: window.location.pathname
  });

  // Redirect users without proper authentication
  if (!user) {
    console.log('OnboardingPage - No user, redirecting to auth');
    navigate('/auth');
    return null;
  }

  // If user doesn't have valid profile, show them the UserOnboarding component instead
  if (!userRole || !organizationId) {
    console.log('OnboardingPage - No userRole/organizationId, redirecting to auth');
    navigate('/auth');
    return null;
  }

  if (!isOnboardingActive) {
    console.log('OnboardingPage - Onboarding not active, redirecting based on role');
    // Redirect based on user role
    if (userRole === 'legal_admin') {
      navigate('/admin');
    } else {
      navigate('/client');
    }
    return null;
  }

  // Show debug info temporarily to understand the issue
  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Debug: Onboarding State</h1>
          <div className="bg-card border rounded-lg p-6 mb-6">
            <pre className="text-sm overflow-auto">
              {JSON.stringify({
                user: !!user,
                userEmail: user?.email,
                userRole,
                organizationId,
                isOnboardingActive,
                currentStep: useOnboardingStore.getState().currentStep,
                totalSteps: useOnboardingStore.getState().totalSteps,
                onboardingData: useOnboardingStore.getState().onboardingData,
                localStorage: localStorage.getItem('onboarding-storage'),
                currentPath: window.location.pathname
              }, null, 2)}
            </pre>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => {
                console.log('Forcing onboarding active');
                useOnboardingStore.setState({ isOnboardingActive: true });
                window.location.reload();
              }}
              className="bg-primary text-primary-foreground px-4 py-2 rounded mr-4"
            >
              Force Activate Onboarding
            </button>
            <button 
              onClick={() => {
                console.log('Resetting onboarding');
                useOnboardingStore.getState().resetOnboarding();
                window.location.reload();
              }}
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded mr-4"
            >
              Reset Onboarding
            </button>
          </div>
        </div>
      </div>
      
      {isOnboardingActive && (
        <OnboardingWizard onClose={handleOnboardingComplete} />
      )}
    </div>
  );
}