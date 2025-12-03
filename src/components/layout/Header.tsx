import { Search, Bell, User, Settings, ChevronDown, LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const displayName = user?.email?.split('@')[0] || 'User';

  return (
    <header className="h-16 bg-header text-header-foreground flex items-center justify-between px-6 border-b border-sidebar-border">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <img src={logo} alt="VendorVigilance" className="w-8 h-8" />
          <span className="font-semibold text-lg tracking-tight">VendorVigilance</span>
        </div>
        
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors, assessments, documents..."
            className="w-80 pl-10 bg-sidebar-accent border-sidebar-border text-header-foreground placeholder:text-muted-foreground focus:ring-secondary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-header-foreground hover:bg-sidebar-accent">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs">
            3
          </Badge>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-header-foreground hover:bg-sidebar-accent">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-4 w-4 text-secondary-foreground" />
              </div>
              <span className="hidden md:block capitalize">{displayName}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="capitalize">{displayName}</span>
                <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
