import { motion, AnimatePresence } from 'framer-motion';
import type { GamePhase } from '../../../../shared/src/types/game';

interface GovernmentBannerProps {
  presidentName: string | null;
  chancellorName: string | null;
  phase: GamePhase;
}

function NameSlot({ title, name }: { title: string; name: string | null }) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      <span className="text-[7px] sm:text-[9px] font-sans font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-amber-600/80">
        {title}
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={name ?? 'empty'}
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 3 }}
          transition={{ duration: 0.15 }}
          className={`text-xs sm:text-sm font-display font-bold ${
            name ? 'text-parchment-100' : 'text-stone-700'
          }`}
        >
          {name ?? '\u2014'}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function GovernmentBanner({
  presidentName,
  chancellorName,
  phase,
}: GovernmentBannerProps) {
  if (phase === 'lobby' || phase === 'role-reveal') return null;

  return (
    <div className="flex items-center gap-2 sm:gap-4 bg-stone-900/70 border border-stone-800/60 rounded px-2.5 py-1 sm:px-4 sm:py-1.5">
      <NameSlot title="Pres" name={presidentName} />
      <span className="text-stone-800 text-[8px]">{'\u2502'}</span>
      <NameSlot title="Chan" name={chancellorName} />
    </div>
  );
}
