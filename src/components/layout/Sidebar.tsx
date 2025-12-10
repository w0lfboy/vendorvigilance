import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  FileText,
  BarChart3,
  FileBarChart,
  Settings,
  HelpCircle,
  TrendingUp,
  ListTodo,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrganization } from '@/hooks/useOrganization';
import appLogo from '@/assets/logo.png';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: BarChart3, label: 'Executive View', href: '/executive' },
  { icon: TrendingUp, label: 'Risk Analytics', href: '/analytics' },
  { icon: Building2, label: 'Vendors', href: '/vendors' },
  { icon: ClipboardCheck, label: 'Assessments', href: '/assessments' },
  { icon: ListTodo, label: 'Remediation', href: '/remediation' },
  { icon: FileText, label: 'Documents', href: '/documents' },
  { icon: FileBarChart, label: 'Reports', href: '/reports' },
];

const bottomNavItems = [
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: HelpCircle, label: 'Help & Support', href: '/help' },
];

export function Sidebar() {
  const { organization } = useOrganization();
  const logoSrc = organization?.logo_url || appLogo;

  return (
    <aside className="hidden md:flex w-64 bg-sidebar text-sidebar-foreground flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)]">
      {/* Organization Logo Header */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img 
            src={logoSrc} 
            alt={organization?.name || 'Organization'} 
            className="w-10 h-10 rounded object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {organization?.name || 'Organization'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {organization?.slug ? `@${organization.slug}` : 'Vendor Risk Management'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 bg-sidebar-accent border-l-2',
                isActive
                  ? 'bg-primary text-primary-foreground border-l-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-accent hover:text-accent-foreground border-l-transparent'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 bg-sidebar-accent border-l-2',
                isActive
                  ? 'bg-primary text-primary-foreground border-l-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-accent hover:text-accent-foreground border-l-transparent'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
