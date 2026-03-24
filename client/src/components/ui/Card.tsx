import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ className = '', children, glow = false }) => {
  return (
    <div
      className={`
        rounded-lg bg-stone-900/90 border border-stone-700/50 p-2.5 sm:p-5
        ${glow ? 'ornate-frame shadow-dramatic' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
