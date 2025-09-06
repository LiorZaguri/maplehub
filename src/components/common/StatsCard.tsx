import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
  iconClassName?: string;
  valueClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  className = '',
  iconClassName = 'text-primary',
  valueClassName = 'text-2xl font-bold',
  titleClassName = 'text-sm text-muted-foreground',
  subtitleClassName = 'text-xs text-muted-foreground mt-1',
}) => {
  return (
    <Card className={`card-glow ${className}`}>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-2">
          <Icon className={`h-8 w-8 ${iconClassName}`} />
          <div>
            <p className={valueClassName}>
              {value}
            </p>
            <p className={titleClassName}>{title}</p>
            {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
