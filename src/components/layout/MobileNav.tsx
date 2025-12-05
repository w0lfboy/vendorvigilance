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
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import logo from '@/assets/logo.png';

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

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-header-foreground">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-sidebar">
        <SheetHeader className="p-4 border-b border-sidebar-border">
          <SheetTitle className="flex items-center gap-2 text-sidebar-foreground">
            <img src={logo} alt="VendorVigilance" className="w-8 h-8" />
            <span className="font-semibold">VendorVigilance</span>
          </SheetTitle>
        </SheetHeader>
        
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <SheetClose asChild key={item.href}>
              <NavLink
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
            </SheetClose>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border space-y-1 mt-auto">
          {bottomNavItems.map((item) => (
            <SheetClose asChild key={item.href}>
              <NavLink
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
            </SheetClose>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
