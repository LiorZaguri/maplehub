import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  Bell,
  Coffee,
  Download,
  Upload,
  Cloud,
  Wrench,
} from 'lucide-react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useServerStatus } from '@/hooks/useServerStatus';
import { useToast } from '@/hooks/use-toast';
import { LayoutToggle } from '../LayoutToggle';
import { DiscordIcon } from '../icons/DiscordIcon';
import { HexaIcon } from '../icons/HexaIcon';
import { topNavItems, toolItems } from '@/data/navigation';

interface TopNavbarActionsProps {
  dataManagement: {
    handleExport: () => void;
    setImportDialogOpen: (open: boolean) => void;
    setDriveDialogOpen: (open: boolean) => void;
  };
}

export const TopNavbarActions = ({ dataManagement }: TopNavbarActionsProps) => {
  const location = useLocation();
  const { toast } = useToast();
  const [canUseNotifications, setCanUseNotifications] = useState(false);
  const [notificationsAllowed, setNotificationsAllowed] = useState(false);
  const { data: serverStatus, loading: serverLoading, lastUpdate } = useServerStatus();

  // Check notification support and permission status
  useEffect(() => {
    if (typeof window === "undefined") return;
    const supported = "Notification" in window;
    setCanUseNotifications(supported);
    if (supported) {
      setNotificationsAllowed(Notification.permission === "granted");
    }
  }, []);

  const handleEnableNotifications = () => {
    if (!canUseNotifications) return;
    
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        setNotificationsAllowed(true);
        toast({
          title: "Notifications enabled",
          description: "You'll be notified when MapleStory servers come back online.",
        });
      } else {
        toast({
          title: "Notifications blocked",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="flex items-center space-x-1 sm:space-x-2 justify-end">
      {/* Data Management Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="space-x-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden xl:inline">Data</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48" sideOffset={5} alignOffset={0}>
          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={dataManagement.handleExport}
              className="w-full justify-start space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dataManagement.setImportDialogOpen(true)}
              className="w-full justify-start space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dataManagement.setDriveDialogOpen(true)}
              className="w-full justify-start space-x-2"
            >
              <Cloud className="h-4 w-4" />
              <span>Google Drive</span>
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Server Status - Compact */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-md bg-muted/50 hover:bg-muted/70"
          >
            {serverLoading ? (
              <div className="w-3 h-3 bg-muted animate-pulse rounded-full"></div>
            ) : serverStatus?.maintenance ? (
              <AlertTriangle className="w-3 h-3 text-orange-500" />
            ) : (
              <CheckCircle className="w-3 h-3 text-green-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {serverLoading ? 'Loading...' : serverStatus?.maintenance ? 'Maintenance' : 'Online'}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64" sideOffset={5} alignOffset={0}>
          <div className="p-3 space-y-3">
            {/* Status Display */}
            <div className="flex items-center space-x-3">
              {serverLoading ? (
                <div className="w-4 h-4 bg-muted animate-pulse rounded-full"></div>
              ) : serverStatus?.maintenance ? (
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              <div>
                <p className="font-medium text-sm">
                  {serverLoading ? 'Loading...' : serverStatus?.maintenance ? 'Maintenance' : 'Online'}
                </p>
                {lastUpdate && (
                  <p className="text-xs text-muted-foreground">
                    Last checked: {lastUpdate.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>

            {/* Notification Settings */}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span className="text-sm">Notifications</span>
                </div>
                {canUseNotifications && !notificationsAllowed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEnableNotifications}
                    className="h-7 px-2 text-xs"
                  >
                    Enable
                  </Button>
                )}
                {canUseNotifications && notificationsAllowed && (
                  <span className="text-xs text-green-600">Enabled</span>
                )}
                {!canUseNotifications && (
                  <span className="text-xs text-muted-foreground">Not supported</span>
                )}
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Discord and Coffee Icons */}
      <a
        href="https://discord.gg/DykSm9Pd9D"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:block"
      >
        <Button
          variant="outline"
          size="sm"
          className="space-x-2"
        >
          <DiscordIcon className="h-4 w-4" />
        </Button>
      </a>
      <a
        href="https://buymeacoffee.com/lzaguri10a"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:block"
      >
        <Button
          variant="outline"
          size="sm"
          className="space-x-2"
        >
          <Coffee className="h-4 w-4" />
        </Button>
      </a>

      {/* Layout Toggle */}
      <LayoutToggle />

      {/* Mobile Menu Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden">
            <span className="sr-only">Open menu</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {topNavItems.filter(item => !item.isDropdown).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <DropdownMenuItem key={item.path} asChild>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-2 ${
                    isActive ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuItem asChild>
            <div className="flex items-center space-x-2">
              <Wrench className="h-4 w-4" />
              <span>Tools</span>
              <ChevronDown className="h-3 w-3 ml-auto" />
            </div>
          </DropdownMenuItem>
          {toolItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <DropdownMenuItem key={item.path} asChild>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-2 ml-4 ${
                    isActive ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  {item.name === 'Fragment Calculator' ? (
                    <HexaIcon className="h-3 w-3" isActive={isActive} />
                  ) : (
                    <Icon className="h-3 w-3" />
                  )}
                  <span className="text-sm">{item.name}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuItem asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={dataManagement.handleExport}
              className="w-full justify-start space-x-2 mt-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dataManagement.setImportDialogOpen(true)}
              className="w-full justify-start space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href="https://discord.gg/DykSm9Pd9D"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start space-x-2"
              >
                <DiscordIcon className="h-4 w-4" />
                <span>Discord</span>
              </Button>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href="https://buymeacoffee.com/lzaguri10a"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start space-x-2"
              >
                <Coffee className="h-4 w-4" />
                <span>Buy me a coffee</span>
              </Button>
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
