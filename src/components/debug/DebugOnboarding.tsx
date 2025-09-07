import { useState, useEffect } from 'react';

export function DebugOnboarding() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // Force check the onboarding store state
    import('@/store/useOnboardingStore').then((module) => {
      const store = module.useOnboardingStore.getState();
      setDebugInfo({
        onboardingStoreState: store,
        localStorage: {
          onboardingStorage: localStorage.getItem('onboarding-storage')
        },
        currentUrl: window.location.href,
        timestamp: new Date().toISOString()
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Debug: Onboarding Page Issue</h1>
        <div className="bg-card border rounded-lg p-6">
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}