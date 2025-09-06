import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useTour } from './TourProvider';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { allTours } from '@/data/tours';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TourTriggerProps {
  tourName?: keyof typeof allTours;
  className?: string;
}

export function TourTrigger({ tourName, className }: TourTriggerProps) {
  const { startTour } = useTour();
  const { isTourCompleted } = useOnboardingStore();

  const handleStartTour = (selectedTour?: keyof typeof allTours) => {
    const tour = selectedTour || tourName;
    if (tour && allTours[tour]) {
      startTour(tour, allTours[tour]);
    }
  };

  if (tourName) {
    // Single tour button
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleStartTour(tourName)}
        className={className}
        title="Iniciar tour guiado"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
    );
  }

  // Dropdown with all available tours
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className}
          title="Tours disponíveis"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Tours Interativos</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => handleStartTour('dashboard')}>
          <div className="flex items-center justify-between w-full">
            <span>Tour do Dashboard</span>
            {isTourCompleted('dashboard') && (
              <span className="text-green-600 text-xs">✓</span>
            )}
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleStartTour('events')}>
          <div className="flex items-center justify-between w-full">
            <span>Tour de Eventos</span>
            {isTourCompleted('events') && (
              <span className="text-green-600 text-xs">✓</span>
            )}
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleStartTour('analytics')}>
          <div className="flex items-center justify-between w-full">
            <span>Tour de Analytics</span>
            {isTourCompleted('analytics') && (
              <span className="text-green-600 text-xs">✓</span>
            )}
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleStartTour('financial')}>
          <div className="flex items-center justify-between w-full">
            <span>Tour Financeiro</span>
            {isTourCompleted('financial') && (
              <span className="text-green-600 text-xs">✓</span>
            )}
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleStartTour('credential')}>
          <div className="flex items-center justify-between w-full">
            <span>Tour de Credenciamento</span>
            {isTourCompleted('credential') && (
              <span className="text-green-600 text-xs">✓</span>
            )}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}