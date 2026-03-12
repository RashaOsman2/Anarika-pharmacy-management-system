import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pill, LogOut, Building2, Crown } from 'lucide-react';

export default function Header() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getRoleBadge = () => {
    if (!profile) return null;
    
    switch (profile.role) {
      case 'owner':
        return (
          <Badge variant="secondary" className="bg-pharmacy-orange-light text-pharmacy-orange border-0">
            <Crown className="h-3 w-3 mr-1" />
            Owner
          </Badge>
        );
      case 'shop1':
        return (
          <Badge variant="secondary" className="bg-pharmacy-blue-light text-pharmacy-blue border-0">
            <Building2 className="h-3 w-3 mr-1" />
            Shop 1
          </Badge>
        );
      case 'shop2':
        return (
          <Badge variant="secondary" className="bg-pharmacy-teal-light text-pharmacy-teal border-0">
            <Building2 className="h-3 w-3 mr-1" />
            Shop 2
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <header className="pharmacy-header text-primary-foreground">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">AnarikaPharma</h1>
              <p className="text-xs text-primary-foreground/70">Multi-Shop Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {getRoleBadge()}
            <span className="text-sm hidden sm:block">{profile?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}