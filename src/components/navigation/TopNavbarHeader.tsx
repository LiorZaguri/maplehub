import { Link } from 'react-router-dom';

interface TopNavbarHeaderProps {
  className?: string;
}

export const TopNavbarHeader = ({ className = '' }: TopNavbarHeaderProps) => {
  return (
    <Link to="/" className={`flex items-center space-x-2 sm:space-x-3 justify-start hover:opacity-80 transition-opacity ${className}`}>
      <img 
        src="./logo_leaf.png" 
        alt="MapleHub Logo" 
        className="h-6 w-6 sm:h-8 sm:w-8 object-contain logo-themed"
      />
      <div>
        <h1 className="logo-text text-sm sm:text-lg">
          MapleHub
        </h1>
      </div>
    </Link>
  );
};
