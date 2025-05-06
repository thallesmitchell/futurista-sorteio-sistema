
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface NumberBadgeProps {
  number: number;
  isHit: boolean;
}

export const NumberBadge: React.FC<NumberBadgeProps> = ({ number, isHit }) => {
  const isMobile = useIsMobile();
  
  return (
    <span 
      className={`
        inline-flex items-center justify-center rounded-full 
        ${isMobile ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'} 
        ${isHit 
          ? 'bg-primary text-primary-foreground font-semibold' 
          : 'bg-muted/30 text-foreground border border-primary/30 backdrop-blur-sm'}
        font-medium transition-all duration-300
      `}
    >
      {String(number).padStart(2, '0')}
    </span>
  );
};
