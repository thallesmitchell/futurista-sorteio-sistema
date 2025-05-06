
import React from 'react';

interface NumberBadgeProps {
  number: number;
  isHit: boolean;
}

export const NumberBadge: React.FC<NumberBadgeProps> = ({ number, isHit }) => (
  <span className={`number-badge ${isHit ? 'number-badge-hit' : ''}`}>
    {number}
  </span>
);
