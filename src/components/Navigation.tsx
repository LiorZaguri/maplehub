import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Users, 
  Sword, 
  Menu,
  TrendingUp
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = useMemo(() => [
    { name: 'Roster', path: '/', icon: Users },
    { name: 'Boss Tracker', path: '/bosses', icon: Sword },
  ], []);

  const NavContent = useMemo(() => () => (
    <div className="flex flex-col space-y-2 py-4">
      <div className="px-4 py-2 mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MapleHub
          </h1>
        </div>
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className="mx-2"
            onClick={() => setIsOpen(false)}
          >
            <Button
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start space-x-2 ${
                isActive 
                  ? 'btn-hero shadow-[var(--shadow-button)]' 
                  : 'hover:bg-card hover:text-primary'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Button>
          </Link>
        );
      })}
    </div>
  ), [navItems, location.pathname, setIsOpen]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block w-64 min-h-screen card-gaming">
        <NavContent />
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4 bg-card border-b border-border">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MapleHub
            </h1>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-card">
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
};

export default Navigation;