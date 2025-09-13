import React from 'react';

interface HexaIconProps {
  className?: string;
  isActive?: boolean;
}

export const HexaIcon: React.FC<HexaIconProps> = ({ className = "h-4 w-4", isActive = false }) => {
    return (
      <img
        src="/skill-images/fragmentIcon.png"
        alt="Fragment"
        className={className}
        style={{
          objectFit: 'contain',
          filter: isActive 
            ? 'brightness(0) saturate(100%)' // Black when active
            : 'brightness(0) saturate(100%) invert(1)', // White when inactive
        }}
      />
    );
};
