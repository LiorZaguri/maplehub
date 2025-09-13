import { Button } from '@/components/ui/button';
import { useLayout } from '@/contexts/LayoutContext';
import { PanelLeft, PanelTop } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LayoutToggleProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const LayoutToggle = ({ 
  variant = 'outline', 
  size = 'sm', 
  showLabel = false,
  className = ''
}: LayoutToggleProps) => {
  const { layoutType, toggleLayout } = useLayout();
  const [isHamburgerMode, setIsHamburgerMode] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsHamburgerMode(window.innerWidth < 1100); // custom breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Don't render if in hamburger mode
  if (isHamburgerMode) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleLayout}
      className={`space-x-2 hidden md:flex ${className}`}
      title={`Switch to ${layoutType === 'sidebar' ? 'top navbar' : 'sidebar'} layout`}
    >
      {layoutType === 'sidebar' ? (
        <PanelTop className="h-4 w-4" />
      ) : (
        <PanelLeft className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="hidden sm:inline">
          {layoutType === 'sidebar' ? 'Top Bar' : 'Sidebar'}
        </span>
      )}
    </Button>
  );
};
