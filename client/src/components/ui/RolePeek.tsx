import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SecretRole, PartyMembership } from '../../../../shared/src/types/game';

interface RolePeekProps {
  role: SecretRole;
  partyMembership: PartyMembership;
  knownFascists: string[];
  knownHitlerId: string | null;
  playerNames: Record<string, string>;
}

const roleStyle: Record<SecretRole, { label: string; color: string; bg: string; border: string; pill: string }> = {
  liberal: { label: 'Liberal', color: 'text-blue-300', bg: 'bg-[#0c1f3a]/95', border: 'border-blue-800/50', pill: 'bg-blue-900/60 text-blue-300 border-blue-700/40' },
  fascist: { label: 'Fascist', color: 'text-red-300', bg: 'bg-[#2a0000]/95', border: 'border-red-900/50', pill: 'bg-red-950/60 text-red-300 border-red-800/40' },
  hitler: { label: 'Hitler', color: 'text-red-400', bg: 'bg-[#1a0000]/95', border: 'border-red-900/60', pill: 'bg-red-950/70 text-red-400 border-red-800/50' },
};

export function RolePeek({ role, partyMembership, knownFascists, knownHitlerId, playerNames }: RolePeekProps) {
  const [open, setOpen] = useState(false);
  const style = roleStyle[role];

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* Dropdown opens upward above the button */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className={`
              absolute bottom-full mb-1.5 p-2.5 sm:p-3 rounded-lg border
              backdrop-blur-md shadow-xl ${style.bg} ${style.border}
              min-w-[140px] sm:min-w-[160px] z-50
            `}
          >
            <p className={`text-sm sm:text-base font-display font-black tracking-wider ${style.color} leading-none`}>
              {style.label}
            </p>
            <p className="text-[8px] sm:text-[9px] font-sans text-stone-500 tracking-wider uppercase mt-0.5">
              {partyMembership === 'liberal' ? 'Liberal Party' : 'Fascist Party'}
            </p>

            {knownFascists.length > 0 && (
              <div className="mt-1.5 pt-1 border-t border-white/5">
                <p className="text-[7px] sm:text-[8px] font-sans uppercase tracking-[0.15em] text-stone-600 mb-0.5">Fascists</p>
                {knownFascists.map(id => (
                  <p key={id} className="text-[11px] sm:text-xs font-display text-red-300/80 leading-tight">{playerNames[id] ?? id}</p>
                ))}
              </div>
            )}

            {knownHitlerId && (
              <div className="mt-1 pt-1 border-t border-white/5">
                <p className="text-[7px] sm:text-[8px] font-sans uppercase tracking-[0.15em] text-stone-600 mb-0.5">Hitler</p>
                <p className="text-[11px] sm:text-xs font-display text-red-400/80 leading-tight">{playerNames[knownHitlerId] ?? knownHitlerId}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button — inline pill */}
      <button
        onClick={() => setOpen(!open)}
        className={`
          px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.12em]
          border transition-all cursor-pointer leading-none
          ${open ? style.pill : 'bg-stone-900/70 text-stone-500 border-stone-700/40 hover:text-stone-300'}
        `}
      >
        {open ? `Hide ${style.label}` : `My Role`}
      </button>
    </div>
  );
}
