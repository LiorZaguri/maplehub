import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Star } from 'lucide-react';

interface TimeDisplayProps {
  type: 'daily' | 'weekly' | 'monthly';
  timeRemaining: string;
  className?: string;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({
  type,
  timeRemaining,
  className = '',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'daily':
        return <Clock className="h-3.5 w-3.5 text-primary" />;
      case 'weekly':
        return <Calendar className="h-3.5 w-3.5 text-primary" />;
      case 'monthly':
        return <Star className="h-3.5 w-3.5 text-primary" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-primary" />;
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return 'Reset';
    }
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {getIcon()}
      <span className="text-xs font-semibold text-primary">{getLabel()}</span>
      <span className="text-xs text-muted-foreground">
        {timeRemaining}
      </span>
    </div>
  );
};

export default TimeDisplay;
