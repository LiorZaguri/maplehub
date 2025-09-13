import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import { toolItems } from '@/data/navigation';
import { HexaIcon } from '@/components/icons/HexaIcon';

interface ToolsSectionProps {
  onItemClick?: () => void;
  className?: string;
}

export const ToolsSection = ({ onItemClick, className = '' }: ToolsSectionProps) => {
  const location = useLocation();
  const [toolsExpanded, setToolsExpanded] = useState(() => {
    // Load saved state from localStorage on initialization
    const saved = localStorage.getItem('navigation-tools-expanded');
    return saved ? JSON.parse(saved) : false;
  });

  // Auto-expand Tools section if a tool page is active
  const isToolActive = toolItems.some(item => location.pathname === item.path);
  useEffect(() => {
    if (isToolActive) {
      setToolsExpanded(true);
    }
  }, [isToolActive]);

  // Save tools expansion state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('navigation-tools-expanded', JSON.stringify(toolsExpanded));
  }, [toolsExpanded]);

  return (
    <div className={className}>
      <Button
        variant="ghost"
        className="w-full justify-start space-x-2 hover:bg-card hover:text-primary mx-2"
        onClick={() => setToolsExpanded(!toolsExpanded)}
      >
        <Wrench className="h-4 w-4" />
        <span>Tools</span>
        {toolsExpanded ? (
          <ChevronUp className="h-4 w-4 ml-auto" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-auto" />
        )}
      </Button>

      {toolsExpanded && (
        <div className="space-y-1 ml-2">
          {toolItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="block"
                onClick={onItemClick}
              >
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start space-x-2 ml-4 ${
                    isActive
                      ? 'btn-hero shadow-[var(--shadow-button)]'
                      : 'hover:bg-card hover:text-primary'
                  }`}
                  size="sm"
                >
                  {item.name === 'Fragment Calculator' ? (
                    <HexaIcon className="h-3 w-3" isActive={isActive} />
                  ) : (
                    <Icon className="h-3 w-3" />
                  )}
                  <span className="text-sm">{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
