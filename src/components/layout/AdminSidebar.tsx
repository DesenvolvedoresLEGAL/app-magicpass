import { NavLink, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Settings,
  Shield
} from 'lucide-react';

const menuItems = [
  { title: 'Organizações', url: '/admin/organizations', icon: Building2 },
  { title: 'Usuários', url: '/admin/users', icon: Users },
  { title: 'Analytics Global', url: '/admin/analytics', icon: BarChart3 },
  { title: 'Configurações', url: '/admin/settings', icon: Settings },
  { title: 'Segurança', url: '/admin/security', icon: Shield },
];

export function AdminSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <aside className="w-64 bg-card border-r border-border h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">
          MagicPass <span className="text-sm text-muted-foreground">Admin</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const active = isActive(item.url);
          return (
            <NavLink
              key={item.url}
              to={item.url}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${active 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }
              `}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}