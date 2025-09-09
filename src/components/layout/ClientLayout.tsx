import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';

interface ClientLayoutProps {
  children: ReactNode;
  showLayout?: boolean; // A propriedade agora é opcional
}

export function ClientLayout({ children, showLayout = true }: ClientLayoutProps) {
  return (
    <div className={`min-h-screen flex w-full bg-background ${showLayout ? '' : 'flex-col'}`}>
      {showLayout && <AppSidebar />}
      <div className={`flex-1 flex flex-col ${!showLayout ? 'w-full' : ''}`}>
        {showLayout && <TopBar />}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
