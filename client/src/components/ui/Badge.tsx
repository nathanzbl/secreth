import React from 'react';

type BadgeVariant = 'president' | 'chancellor' | 'dead' | 'you' | 'hitler' | 'fascist' | 'liberal';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  president:
    'bg-amber-900/50 text-amber-400 border-amber-700/40',
  chancellor:
    'bg-amber-950/50 text-amber-500 border-amber-800/40',
  dead:
    'bg-stone-900/50 text-stone-500 border-stone-700/40',
  you:
    'bg-amber-950/40 text-amber-500 border-amber-700/30',
  hitler:
    'bg-red-950/60 text-red-300 border-red-800/50',
  fascist:
    'bg-red-950/50 text-red-400 border-red-700/40',
  liberal:
    'bg-blue-950/50 text-blue-400 border-blue-700/40',
};

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-display font-bold
        uppercase tracking-[0.15em] border
        ${variantClasses[variant]}
      `}
    >
      {children}
    </span>
  );
};
