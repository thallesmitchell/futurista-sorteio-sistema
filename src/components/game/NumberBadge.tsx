
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
        inline-flex items-center justify-center rounded-md
        ${isMobile ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'} 
        ${isHit 
          ? 'bg-[#1db954] text-white font-bold' 
          : 'bg-transparent text-[#C8C8C9] border border-[#333] backdrop-blur-sm'}
        font-medium transition-all duration-300
      `}
    >
      {String(number).padStart(2, '0')}
    </span>
  );
};
