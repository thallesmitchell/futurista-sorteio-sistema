
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
  let baseClasses = 'inline-flex items-center justify-center rounded-full';
  
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
  
  // Estilo corrigido: números acertados com fundo verde sólido, não acertados com borda verde
  let hitClasses = '';
  if (hits > 0 || isHit) {
    // Acertos com fundo verde sólido
    hitClasses = 'bg-green-500 text-white border-0 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
  } else {
    // Números não acertados apenas com contorno verde e fundo escuro
    hitClasses = 'border border-green-500 text-white bg-background';
  }
  
  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${hitClasses} ${className}`}>
      {String(number).padStart(2, '0')}
    </span>
  );
};

// Also export as default for backward compatibility
export default NumberBadge;
