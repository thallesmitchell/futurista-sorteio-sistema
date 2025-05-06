
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
        ${isMobile ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'} 
        ${isHit 
          ? 'bg-primary text-primary-foreground animate-pulse-glow' 
          : 'bg-muted text-muted-foreground'}
        font-medium
      `}
    >
      {number}
    </span>
  );
};
