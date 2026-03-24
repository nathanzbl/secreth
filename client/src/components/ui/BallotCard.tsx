import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BallotCardProps {
  vote: 'ja' | 'nein';
  revealed?: boolean;
  size?: 'sm' | 'md';
}

const sizeClasses: Record<string, { card: string; text: string; sub: string }> = {
  sm: { card: 'w-12 h-18 sm:w-16 sm:h-24', text: 'text-sm sm:text-lg', sub: 'text-[6px] sm:text-[7px]' },
  md: { card: 'w-20 h-28 sm:w-24 sm:h-36', text: 'text-xl sm:text-2xl', sub: 'text-[8px] sm:text-[10px]' },
};

const voteStyles = {
  ja: {
    bg: 'bg-parchment-50',
    border: 'border-stone-400',
    text: 'text-stone-900',
    label: 'Ja!',
    sub: '(YES)',
  },
  nein: {
    bg: 'bg-gradient-to-b from-stone-800 to-stone-950',
    border: 'border-stone-600',
    text: 'text-parchment-100',
    label: 'nein',
    sub: '(NO)',
  },
};

export const BallotCard: React.FC<BallotCardProps> = ({
  vote,
  revealed = false,
  size = 'md',
}) => {
  const s = sizeClasses[size];
  const v = voteStyles[vote];

  return (
    <div className={`${s.card}`} style={{ perspective: '600px' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={revealed ? 'front' : 'back'}
          initial={{ rotateY: 90 }}
          animate={{ rotateY: 0 }}
          exit={{ rotateY: -90 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {revealed ? (
            <div
              className={`
                w-full h-full rounded-md ${v.bg} ${v.border} border-2
                flex flex-col items-center justify-center gap-0.5
                shadow-lg
              `}
            >
              <span className={`${s.text} font-display font-black italic ${v.text}`}>
                {v.label}
              </span>
              <span className={`${s.sub} font-sans font-semibold tracking-widest ${v.text} opacity-50 uppercase`}>
                {v.sub}
              </span>
            </div>
          ) : (
            <div
              className="w-full h-full rounded-md bg-gradient-to-b from-stone-700 to-stone-900 border-2 border-stone-600 flex items-center justify-center shadow-lg"
            >
              <div className="w-3/5 h-1/2 rounded border border-stone-500/20 bg-stone-800/50 flex items-center justify-center">
                <span className="text-stone-500 font-display font-bold text-xs tracking-widest">VOTE</span>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
