'use client';

import { useRef, ReactNode, useState } from 'react';
import './SpotlightCard.css';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

const SpotlightCard = ({ 
  children, 
  className = '', 
  spotlightColor = 'rgba(82, 183, 136, 0.4)' 
}: SpotlightCardProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
    divRef.current.style.setProperty('--spotlight-color', spotlightColor);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (divRef.current) {
      divRef.current.style.setProperty('--spotlight-color', spotlightColor);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div 
      ref={divRef} 
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`card-spotlight ${isHovered ? 'spotlight-active' : ''} ${className}`}
      style={{
        '--spotlight-color': spotlightColor,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

export default SpotlightCard;

