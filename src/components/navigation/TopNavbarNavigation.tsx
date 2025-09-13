import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { topNavItems, toolItems } from '@/data/navigation';
import { HexaIcon } from '@/components/icons/HexaIcon';

export const TopNavbarNavigation = () => {
  const location = useLocation();
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  return (
    <div className="hidden md:flex items-center space-x-1 justify-center">
      {topNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        // Handle Tools dropdown
        if (item.isDropdown) {
          return (
            <DropdownMenu 
              key={item.name} 
              open={toolsDropdownOpen} 
              onOpenChange={setToolsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="space-x-2 hover:bg-card hover:text-primary"
                  onMouseEnter={() => setToolsDropdownOpen(true)}
                  onMouseLeave={() => setToolsDropdownOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48" 
                sideOffset={5} 
                alignOffset={0}
                onMouseEnter={() => setToolsDropdownOpen(true)}
                onMouseLeave={() => setToolsDropdownOpen(false)}
              >
                {toolItems.map((toolItem) => {
                  const ToolIcon = toolItem.icon;
                  const isToolActive = location.pathname === toolItem.path;

                  return (
                    <DropdownMenuItem key={toolItem.path} asChild>
                      <Link
                        to={toolItem.path}
                        className={`flex items-center space-x-2 ${
                          isToolActive ? 'bg-accent text-accent-foreground' : ''
                        }`}
                      >
                        {toolItem.name === 'Fragment Calculator' ? (
                          <HexaIcon className="h-4 w-4" isActive={isToolActive} />
                        ) : (
                          <ToolIcon className="h-4 w-4" />
                        )}
                        <span>{toolItem.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        // Handle regular navigation items
        return (
          <Link
            key={item.path}
            to={item.path}
          >
            <Button
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={`space-x-2 ${
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
  );
};
