import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { toast } from '@/hooks/use-toast';

import { doc, setDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, userRole, organizationId } = useAuth();
  const {
    isOnboardingActive,
    setIsOnboardingActive,
    onboardingData,
    completeOnboarding
  } = useOnboardingStore();

  useEffect(() => {
    if (!isOnboardingActive) {
      setIsOnboardingActive(true);
    }
  }, [isOnboardingActive, setIsOnboardingActive]);

  const handleOnboardingComplete = async () => {
    try {
      const uid = user?.uid;
      if (!uid) {
        toast({
          title: 'Erro de autenticação',
          description: 'Usuário não está autenticado.',
          variant: 'destructive'
        });
        return;
      }

      // 1. Criar perfil do usuário (caso ainda não tenha)
      if (!userRole || !organizationId) {
        const generatedOrgId = crypto.randomUUID();

        await setDoc(doc(db, 'users', uid), {
          email: user.email,
          name: onboardingData.userName || 'Usuário',
          role: 'client_admin',
          organization_id: generatedOrgId
        });

        // 2. Criar organização
        await setDoc(doc(db, 'organizations', generatedOrgId), {
          name: onboardingData.companyName,
          primary_color: onboardingData.primaryColor,
          secondary_color: onboardingData.secondaryColor,
          logo_url: onboardingData.logoUrl || '',
          created_by: uid,
          created_at: serverTimestamp()
        });
      }

      // 3. Criar primeiro evento/ambiente
      if (onboardingData.environmentName) {
        const finalOrgId = organizationId || crypto.randomUUID();
        const startDate = onboardingData.environmentDate
          ? `${onboardingData.environmentDate}T09:00:00Z`
          : new Date().toISOString();

        const endDate = onboardingData.environmentDate
          ? `${onboardingData.environmentDate}T23:59:00Z`
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

        await addDoc(collection(db, 'events'), {
          name: onboardingData.environmentName,
          organization_id: finalOrgId,
          start_date: startDate,
          end_date: endDate,
          capacity: parseInt(onboardingData.environmentCapacity) || 500,
          status: 'draft',
          description: 'Ambiente criado durante o onboarding',
          created_at: serverTimestamp()
        });

        toast({
          title: 'Evento criado!',
          description: 'Seu primeiro ambiente foi criado com sucesso.',
        });
      }

      completeOnboarding();

      toast({
        title: 'Configuração concluída!',
        description: 'Sua conta foi configurada com sucesso.',
      });

      setTimeout(() => {
        window.location.href = '/client';
      }, 500);
    } catch (error) {
      console.error('Erro ao concluir onboarding:', error);
      toast({
        title: 'Erro na configuração',
        description: 'Houve um problema ao salvar suas configurações.',
        variant: 'destructive'
      });
    }
  };

  // Redireciona se já estiver tudo completo
  if (user && userRole && organizationId && !isOnboardingActive) {
    if (userRole === 'legal_admin') {
      navigate('/admin');
    } else {
      navigate('/client');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <OnboardingWizard onClose={handleOnboardingComplete} />
    </div>
  );
}
