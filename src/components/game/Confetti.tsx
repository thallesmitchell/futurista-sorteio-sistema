
import React from 'react';

interface ConfettiProps {
  count?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ count = 200 }) => {
  const colors = ['#ff0080', '#7b1fa2', '#00bcd4', '#ff9100', '#8bc34a', '#4caf50', '#e91e63', '#2196f3'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: count }).map((_, i) => {
        const style = {
          left: `${Math.random() * 100}%`,
          top: `-5%`,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${Math.random() * 3 + 2}s`,
        };
        
        return <div key={i} className="confetti" style={style} />;
      })}
    </div>
  );
};

export default Confetti;
