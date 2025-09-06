import { 
  LayoutDashboard, 
  Calendar, 
  UserCheck, 
  Activity, 
  FileText, 
  Settings,
  Zap,
  Palette,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const menuItems = [
  { title: 'Dashboard', url: '/client', icon: LayoutDashboard },
  { title: 'Eventos', url: '/client/eventos', icon: Calendar },
  { title: 'Branding', url: '/client/branding', icon: Palette },
  { title: 'Credenciamento', url: '/client/credenciamento', icon: UserCheck },
  { title: 'Tempo Real', url: '/client/tempo-real', icon: Activity },
  { title: 'Relatórios', url: '/client/relatorios', icon: FileText },
  { title: 'Financeiro', url: '/client/financeiro', icon: DollarSign },
  { title: 'Analytics', url: '/client/analytics', icon: BarChart3 },
  { title: 'Configurações', url: '/client/config', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <div className="w-64 h-full bg-background border-r border-border flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-6 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MagicPass
          </h1>
          <p className="text-xs text-muted-foreground">Credenciamento</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4">
        <div className="mb-2">
          <h2 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Menu Principal
          </h2>
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.url);
            return (
              <NavLink
                key={item.title}
                to={item.url}
                end={item.url === '/'}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${active 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.title}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}