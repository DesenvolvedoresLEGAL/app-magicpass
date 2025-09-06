import { 
  LayoutDashboard, 
  Calendar, 
  UserCheck, 
  Activity, 
  FileText, 
  Settings,
  Zap
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Eventos', url: '/eventos', icon: Calendar },
  { title: 'Credenciamento', url: '/credenciamento', icon: UserCheck },
  { title: 'Tempo Real', url: '/tempo-real', icon: Activity },
  { title: 'Relatórios', url: '/relatorios', icon: FileText },
  { title: 'Configurações', url: '/config', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? 'bg-primary text-primary-foreground font-medium hover:bg-primary/90' 
      : 'text-muted-foreground hover:bg-muted hover:text-foreground';

  return (
    <Sidebar collapsible="none" className="w-64 border-r">
      <SidebarContent>
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-6 border-b">
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

        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/'}
                      className={getNavClass}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}