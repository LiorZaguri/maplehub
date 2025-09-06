import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  Sword,
  Menu,
  TrendingUp,
  Server,
  CheckSquare,
  Coffee,
  LogIn,
  LogOut,
  User
} from 'lucide-react';
import { ServerStatusIndicator } from './ServerStatusIndicator';
import { useAuth } from '@/contexts/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, signInWithDiscord, signInWithGoogle, signOut } = useAuth();

  const navItems = useMemo(() => [
    { name: 'Roster', path: '/', icon: Users },
    { name: 'Boss Tracker', path: '/bosses', icon: Sword },
    { name: 'Daily Tracker', path: '/tasks', icon: CheckSquare },
    { name: 'Server Status', path: '/server-status', icon: Server },
  ], []);

  const NavContent = useMemo(() => () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MapleHub
          </h1>
        </div>
      </div>

      <div className="flex-1 space-y-2 pb-4">
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

      {/* Auth Section */}
      <div className="px-4 py-4 border-t border-border/50">
        {loading ? (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        ) : user ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-card/50">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.user_metadata?.full_name || user.user_metadata?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => signInWithDiscord()}
              className="w-full"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign in with Discord
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signInWithGoogle()}
              className="w-full"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign in with Google
            </Button>
          </div>
        )}
      </div>

      <div className="px-4 py-4 border-t border-border/50 mt-4">
        <a
          href="https://buymeacoffee.com/lzaguri10a"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-amber-200 hover:border-amber-300 text-amber-800 hover:text-amber-900 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Coffee className="h-4 w-4 mr-2" />
            Buy me a coffee
          </Button>
        </a>
      </div>
    </div>
  ), [navItems, location.pathname, setIsOpen, user, loading, signInWithDiscord, signInWithGoogle, signOut]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden xl:block w-64 min-h-screen card-gaming fixed left-0 top-0 z-40">
        <NavContent />
      </nav>

      {/* Mobile Navigation */}
      <div className="xl:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-20">
        <div className="flex items-center justify-between p-3 sm:p-4 h-full">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MapleHub
            </h1>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-card">
              <div className="flex flex-col h-full">
                <div className="px-4 py-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      MapleHub
                    </h1>
                  </div>
                </div>
                <div className="sr-only">
                  <h2>Navigation Menu</h2>
                </div>

                <div className="flex-1 space-y-2 pb-4">
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

                {/* Auth Section - Mobile */}
                <div className="px-4 py-4 border-t border-border/50">
                  {loading ? (
                    <div className="flex items-center justify-center py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  ) : user ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-2 rounded-lg bg-card/50">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.user_metadata?.full_name || user.user_metadata?.name || 'User'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => signOut()}
                        className="w-full"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => signInWithDiscord()}
                        className="w-full"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign in with Discord
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => signInWithGoogle()}
                        className="w-full"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign in with Google
                      </Button>
                    </div>
                  )}
                </div>

                <div className="px-4 py-4 border-t border-border/50 mt-4">
                  <a
                    href="https://buymeacoffee.com/lzaguri10a"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-amber-200 hover:border-amber-300 text-amber-800 hover:text-amber-900 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Coffee className="h-4 w-4 mr-2" />
                      Buy me a coffee
                    </Button>
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
};

export default Navigation;
