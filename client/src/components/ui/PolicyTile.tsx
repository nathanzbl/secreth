import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PolicyType } from '../../../../shared/src/types/game';

interface PolicyTileProps {
  type: PolicyType;
  size?: 'sm' | 'md' | 'lg';
  revealed?: boolean;
}

const sizeClasses: Record<string, { card: string; icon: string; label: string; sublabel: string }> = {
  sm: { card: 'w-10 h-14 sm:w-12 sm:h-16', icon: 'text-sm sm:text-base', label: 'text-[6px] sm:text-[7px]', sublabel: 'text-[5px]' },
  md: { card: 'w-16 h-22 sm:w-20 sm:h-28', icon: 'text-xl sm:text-2xl', label: 'text-[8px] sm:text-[10px]', sublabel: 'text-[6px] sm:text-[7px]' },
  lg: { card: 'w-20 h-28 sm:w-28 sm:h-40', icon: 'text-2xl sm:text-4xl', label: 'text-[10px] sm:text-sm', sublabel: 'text-[7px] sm:text-[9px]' },
};

const typeStyles: Record<PolicyType, {
  bg: string; border: string; headerBg: string;
  icon: string; label: string; accent: string;
}> = {
  liberal: {
    bg: 'bg-gradient-to-b from-[#0c1f3a] to-[#060e1c]',
    border: 'border-blue-700/60',
    headerBg: 'bg-blue-800/60',
    icon: '\u{1F54A}\uFE0F',
    label: 'LIBERAL',
    accent: 'text-blue-300',
  },
  fascist: {
    bg: 'bg-gradient-to-b from-[#3b0000] to-[#1a0000]',
    border: 'border-red-800/60',
    headerBg: 'bg-red-900/60',
    icon: '\u{1F480}',
    label: 'FASCIST',
    accent: 'text-red-300',
  },
};

export const PolicyTile: React.FC<PolicyTileProps> = ({
  type,
  size = 'md',
  revealed = true,
}) => {
  const s = sizeClasses[size];
  const t = typeStyles[type];

  return (
    <div className={`${s.card} perspective-[600px]`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={revealed ? 'front' : 'back'}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: -90, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {revealed ? (
            <div
              className={`
                w-full h-full rounded-md ${t.bg} ${t.border} border-2
                flex flex-col items-center justify-between
                shadow-lg overflow-hidden
              `}
            >
              {/* Header bar */}
              <div className={`w-full ${t.headerBg} py-0.5 flex items-center justify-center`}>
                <span className={`${s.sublabel} font-sans font-bold tracking-[0.2em] ${t.accent} uppercase`}>
                  Article
                </span>
              </div>
              {/* Center icon */}
              <div className="flex-1 flex flex-col items-center justify-center gap-1">
                <span className={s.icon} role="img" aria-label={type}>
                  {t.icon}
                </span>
                <span className={`${s.label} font-display font-bold tracking-[0.15em] ${t.accent} uppercase`}>
                  {t.label}
                </span>
              </div>
              {/* Bottom decoration - lines like newspaper text */}
              <div className="w-full px-2 pb-1.5 space-y-0.5">
                <div className={`h-px ${type === 'liberal' ? 'bg-blue-500/15' : 'bg-red-500/15'}`} />
                <div className={`h-px ${type === 'liberal' ? 'bg-blue-500/10' : 'bg-red-500/10'} w-3/4 mx-auto`} />
                <div className={`h-px ${type === 'liberal' ? 'bg-blue-500/8' : 'bg-red-500/8'} w-1/2 mx-auto`} />
              </div>
            </div>
          ) : (
            <div
              className="w-full h-full rounded-md bg-gradient-to-b from-stone-700 to-stone-900 border-2 border-stone-600 flex items-center justify-center shadow-lg"
            >
              <div className="w-3/4 h-3/4 rounded border border-stone-500/30 bg-stone-800/60 flex items-center justify-center">
                <span className={`${s.icon} text-stone-500 font-display`}>?</span>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
