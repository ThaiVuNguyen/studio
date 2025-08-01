"use client"

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ConfettiProps {
  isActive: boolean;
  count?: number;
}

const Confetti: React.FC<ConfettiProps> = ({ isActive, count = 50 }) => {
  const confettiPieces = useMemo(() => {
    if (!isActive) return [];
    
    const colors = ['#673AB7', '#3F51B5', '#4CAF50', '#FFC107', '#F44336'];
    
    return Array.from({ length: count }).map((_, i) => {
      const style: React.CSSProperties = {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${2 + Math.random() * 3}s`,
        backgroundColor: colors[i % colors.length],
        transform: `rotate(${Math.random() * 360}deg)`,
      };
      return <div key={i} className="confetti-piece" style={style}></div>;
    });
  }, [isActive, count]);

  if (!isActive) return null;

  return (
    <>
      <style jsx>{`
        .confetti-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 9999;
        }
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 16px;
          opacity: 0;
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: 1;
        }
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
      <div className="confetti-container">{confettiPieces}</div>
    </>
  );
};

export default Confetti;
