import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavigationItem as NavigationItemType } from '@/data/navigation';

interface NavigationItemProps {
  item: NavigationItemType;
  onClick?: () => void;
  className?: string;
  size?: 'default' | 'sm';
}

export const NavigationItem = ({ 
  item, 
  onClick, 
  className = '',
  size = 'default'
}: NavigationItemProps) => {
  const location = useLocation();
  const Icon = item.icon;
  const isActive = location.pathname === item.path;

  return (
    <Link
      to={item.path || '#'}
      className={className}
      onClick={onClick}
    >
      <Button
        variant={isActive ? "default" : "ghost"}
        size={size}
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
};
