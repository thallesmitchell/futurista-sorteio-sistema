
import React from 'react';
import { cn } from '@/lib/utils';

export interface NumberBadgeProps {
  number: number;
  hits?: number;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isHit?: boolean;
}

export const NumberBadge = ({ 
  number, 
  hits = 0, 
  isHit, 
  className = '', 
  variant = 'default', 
  size = 'md' 
}: NumberBadgeProps) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  };
  
  // Base classes for all number badges
  const baseClasses = 'inline-flex items-center justify-center rounded-full leading-none';
  
  // Determine if the number is a hit
  const isNumberHit = hits > 0 || isHit === true;
  
  // Apply appropriate styling based on hit status
  const hitClasses = isNumberHit
    ? 'bg-green-500 text-white border-0 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
    : 'border border-green-500 text-white bg-background';
  
  return (
    <span className={cn(
      baseClasses,
      sizeClasses[size],
      hitClasses,
      className
    )}>
      {String(number).padStart(2, '0')}
    </span>
  );
};

export default NumberBadge;
