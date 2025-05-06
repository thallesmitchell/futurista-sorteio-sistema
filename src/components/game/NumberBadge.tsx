
import React from 'react';

export interface NumberBadgeProps {
  number: number;
  hits?: number;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isHit?: boolean;
}

export const NumberBadge = ({ number, hits = 0, isHit, className = '', variant = 'default', size = 'md' }: NumberBadgeProps) => {
  let baseClasses = 'inline-flex items-center justify-center rounded-full font-medium';
  
  // Classes baseadas no tamanho
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  };
  
  // Classes baseadas na variante
  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    outline: 'border border-primary text-primary',
    secondary: 'bg-secondary text-secondary-foreground'
  };
  
  // Adicionar classes para quando tem hits ou isHit
  const hitClasses = (hits > 0 || isHit) ? 'ring-2 ring-green-500 ring-offset-1' : '';
  
  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${hitClasses} ${className}`}>
      {number}
    </span>
  );
};
