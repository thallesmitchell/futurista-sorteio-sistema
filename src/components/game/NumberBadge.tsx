
import React from 'react';

export interface NumberBadgeProps {
  number: number;
  hits?: number;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isHit?: boolean;
}

// Export both as default and named export to prevent breaking existing imports
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
    default: 'border border-primary text-primary bg-transparent',
    outline: 'border border-primary text-primary bg-transparent',
    secondary: 'bg-secondary text-secondary-foreground'
  };
  
  // Adicionar classes para quando tem hits ou isHit - agora com estilos distintos
  let hitClasses = '';
  if (hits > 0 || isHit) {
    // Acertos com fundo verde e efeito de sombra brilhante
    hitClasses = 'bg-green-500 text-white border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] ring-2 ring-green-500/50 ring-offset-1';
  } else {
    // Números regulares com apenas contorno verde, fundo escuro e fonte branca
    hitClasses = 'border-green-500 text-white bg-background';
  }
  
  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${hitClasses} ${className}`}>
      {String(number).padStart(2, '0')}
    </span>
  );
};

// Also export as default for backward compatibility
export default NumberBadge;
