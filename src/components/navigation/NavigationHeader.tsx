import { Link } from 'react-router-dom';

interface NavigationHeaderProps {
  className?: string;
  showSubtitle?: boolean;
}

export const NavigationHeader = ({ className = '', showSubtitle = true }: NavigationHeaderProps) => {
  return (
    <div className={`px-4 pt-6 mb-6 ${className}`}>
      <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
        <img 
          src="./logo_leaf.png" 
          alt="MapleHub Logo" 
          className="h-8 w-8 object-contain logo-themed"
        />
        <div>
          <h1 className="logo-text">
            MapleHub
          </h1>
          {showSubtitle && (
            <p className="text-xs text-muted-foreground mt-1">
              Your Maplestory Companion
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};
