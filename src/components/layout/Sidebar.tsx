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
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: BarChart3, label: 'Executive View', href: '/executive' },
  { icon: Building2, label: 'Vendors', href: '/vendors' },
  { icon: ClipboardCheck, label: 'Assessments', href: '/assessments' },
  { icon: FileText, label: 'Documents', href: '/documents' },
  { icon: FileBarChart, label: 'Reports', href: '/reports' },
];

const bottomNavItems = [
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: HelpCircle, label: 'Help & Support', href: '/help' },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 bg-sidebar text-sidebar-foreground flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)]">
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
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
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
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
