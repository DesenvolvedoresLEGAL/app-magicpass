import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface OnboardingData {
  // Company Setup
  companyName: string;
  companyType: string;
  teamSize: string;
  
  // Branding
  logoFile: File | null;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  
  // Team
  teamEmails: string[];
  
  // First Event
  eventName: string;
  eventType: string;
  eventDate: string;
  eventCapacity: string;
}

export interface TourStep {
  target: string;
  content: string;
  title: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  disableBeacon?: boolean;
}

export interface OnboardingStore {
  // Onboarding State
  currentStep: number;
  totalSteps: number;
  isOnboardingActive: boolean;
  onboardingData: OnboardingData;
  
  // Tour State
  isTourActive: boolean;
  currentTour: string | null;
  completedTours: string[];
  tourSteps: TourStep[];
  
  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  completeOnboarding: () => void;
  
  // Tour Actions
  startTour: (tourName: string, steps: TourStep[]) => void;
  endTour: () => void;
  markTourCompleted: (tourName: string) => void;
  isTourCompleted: (tourName: string) => boolean;
  resetOnboarding: () => void;
}

const initialOnboardingData: OnboardingData = {
  companyName: '',
  companyType: '',
  teamSize: '',
  logoFile: null,
  logoUrl: '',
  primaryColor: '#3b82f6',
  secondaryColor: '#1e40af',
  teamEmails: [],
  eventName: '',
  eventType: '',
  eventDate: '',
  eventCapacity: '',
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      // Initial State
      currentStep: 0,
      totalSteps: 5,
      isOnboardingActive: false,
      onboardingData: initialOnboardingData,
      
      isTourActive: false,
      currentTour: null,
      completedTours: [],
      tourSteps: [],
      
      // Onboarding Actions
      setCurrentStep: (step) => set({ currentStep: step }),
      
      nextStep: () => set((state) => ({ 
        currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1) 
      })),
      
      prevStep: () => set((state) => ({ 
        currentStep: Math.max(state.currentStep - 1, 0) 
      })),
      
      updateOnboardingData: (data) => set((state) => ({
        onboardingData: { ...state.onboardingData, ...data }
      })),
      
      completeOnboarding: () => set({ 
        isOnboardingActive: false,
        currentStep: 0 
      }),
      
      // Tour Actions
      startTour: (tourName, steps) => set({
        isTourActive: true,
        currentTour: tourName,
        tourSteps: steps
      }),
      
      endTour: () => {
        const { currentTour } = get();
        if (currentTour) {
          get().markTourCompleted(currentTour);
        }
        set({
          isTourActive: false,
          currentTour: null,
          tourSteps: []
        });
      },
      
      markTourCompleted: (tourName) => set((state) => ({
        completedTours: [...state.completedTours.filter(t => t !== tourName), tourName]
      })),
      
      isTourCompleted: (tourName) => get().completedTours.includes(tourName),
      
      resetOnboarding: () => set({
        currentStep: 0,
        isOnboardingActive: false,
        onboardingData: initialOnboardingData,
        completedTours: [],
        isTourActive: false,
        currentTour: null,
        tourSteps: []
      })
    }),
    {
      name: 'onboarding-storage',
      partialize: (state) => ({
        completedTours: state.completedTours,
        onboardingData: state.onboardingData,
      }),
    }
  )
);