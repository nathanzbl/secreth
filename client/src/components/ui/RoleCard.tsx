import React from 'react';
import { motion } from 'framer-motion';
import type { SecretRole, PartyMembership } from '../../../../shared/src/types/game';

interface RoleCardProps {
  role: SecretRole;
  partyMembership: PartyMembership;
}

const roleConfig: Record<SecretRole, {
  label: string;
  icon: string;
  bg: string;
  border: string;
  glow: string;
  accent: string;
  sealBg: string;
}> = {
  liberal: {
    label: 'LIBERAL',
    icon: '\u{1F54A}\uFE0F',
    bg: 'bg-gradient-to-b from-[#0c1f3a] via-[#0e2544] to-[#060e1c]',
    border: 'border-blue-700/50',
    glow: 'shadow-[0_0_30px_rgba(30,64,175,0.3)]',
    accent: 'text-blue-300',
    sealBg: 'bg-blue-800/30',
  },
  fascist: {
    label: 'FASCIST',
    icon: '\u{1F480}',
    bg: 'bg-gradient-to-b from-[#3b0000] via-[#2a0000] to-[#1a0000]',
    border: 'border-red-800/50',
    glow: 'shadow-[0_0_30px_rgba(139,0,0,0.3)]',
    accent: 'text-red-300',
    sealBg: 'bg-red-900/30',
  },
  hitler: {
    label: 'HITLER',
    icon: '\u{1F480}',
    bg: 'bg-gradient-to-b from-[#2a0000] via-[#1a0000] to-[#0a0000]',
    border: 'border-red-900/60',
    glow: 'shadow-[0_0_40px_rgba(139,0,0,0.4)]',
    accent: 'text-red-400',
    sealBg: 'bg-red-950/40',
  },
};

const partyLabel: Record<PartyMembership, string> = {
  liberal: 'Liberal Party',
  fascist: 'Fascist Party',
};

const partyColor: Record<PartyMembership, string> = {
  liberal: 'text-blue-400/80',
  fascist: 'text-red-400/80',
};

export const RoleCard: React.FC<RoleCardProps> = ({ role, partyMembership }) => {
  const config = roleConfig[role];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
      className={`
        w-56 h-80 rounded-xl ${config.bg} ${config.border} border-2
        flex flex-col items-center justify-center gap-3
        ${config.glow}
        select-none overflow-hidden relative
      `}
    >
      {/* Top label */}
      <div className="absolute top-0 left-0 right-0 py-1.5 bg-black/20 text-center">
        <span className="text-[8px] font-sans font-bold uppercase tracking-[0.3em] text-white/40">
          Your Secret Role
        </span>
      </div>

      {/* Decorative rule */}
      <div className="deco-rule w-3/4 mt-4" />

      {/* Seal circle */}
      <div className={`w-20 h-20 rounded-full ${config.sealBg} border border-white/10 flex items-center justify-center`}>
        <motion.span
          className="text-5xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.4 }}
          role="img"
          aria-label={role}
        >
          {config.icon}
        </motion.span>
      </div>

      {/* Role name */}
      <motion.h2
        className={`text-2xl font-display font-black tracking-[0.25em] ${config.accent}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {config.label}
      </motion.h2>

      {/* Party membership */}
      <motion.p
        className={`text-xs font-sans font-semibold tracking-[0.2em] uppercase ${partyColor[partyMembership]}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {partyLabel[partyMembership]}
      </motion.p>

      {/* Decorative rule */}
      <div className="deco-rule w-3/4" />

      {/* Hitler special mark */}
      {role === 'hitler' && (
        <motion.p
          className="text-[10px] text-red-600/60 font-display font-bold tracking-[0.3em] uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Secret Hitler
        </motion.p>
      )}
    </motion.div>
  );
};
