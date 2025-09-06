import { createContext, useContext, ReactNode } from 'react';
import Joyride, { Step, CallBackProps, STATUS, EVENTS } from 'react-joyride';
import { useOnboardingStore, TourStep } from '@/store/useOnboardingStore';

interface TourContextType {
  startTour: (tourName: string, steps: TourStep[]) => void;
  endTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}

interface TourProviderProps {
  children: ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const { 
    isTourActive, 
    tourSteps, 
    startTour: startTourStore, 
    endTour: endTourStore 
  } = useOnboardingStore();

  const joyrideSteps: Step[] = tourSteps.map(step => ({
    target: step.target,
    content: step.content,
    title: step.title,
    placement: step.placement || 'bottom',
    disableBeacon: step.disableBeacon || false,
  }));

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Update step index if needed
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      endTourStore();
    }
  };

  const startTour = (tourName: string, steps: TourStep[]) => {
    startTourStore(tourName, steps);
  };

  const endTour = () => {
    endTourStore();
  };

  return (
    <TourContext.Provider value={{ startTour, endTour }}>
      {children}
      <Joyride
        steps={joyrideSteps}
        run={isTourActive}
        continuous
        showProgress
        showSkipButton
        hideCloseButton={false}
        scrollToFirstStep
        spotlightClicks
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: 'hsl(var(--primary))',
            textColor: 'hsl(var(--foreground))',
            backgroundColor: 'hsl(var(--background))',
            overlayColor: 'rgba(0, 0, 0, 0.4)',
            spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          },
          tooltip: {
            fontSize: '14px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          },
          tooltipContainer: {
            textAlign: 'left' as const,
          },
          tooltipTitle: {
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '8px',
          },
          buttonNext: {
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          buttonBack: {
            color: 'hsl(var(--muted-foreground))',
            marginRight: '8px',
          },
          buttonSkip: {
            color: 'hsl(var(--muted-foreground))',
          },
        }}
        locale={{
          back: 'Voltar',
          close: 'Fechar',
          last: 'Finalizar',
          next: 'Próximo',
          open: 'Abrir',
          skip: 'Pular tour',
        }}
      />
    </TourContext.Provider>
  );
}