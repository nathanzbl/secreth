import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { Card } from '../ui/Card';

const COUNTDOWN_SECONDS = 8;

const roleConfig = {
  liberal: {
    title: 'Liberal',
    bgClass: 'liberal-board',
    textClass: 'text-blue-400',
    tagline: 'Enact 5 Liberal policies to win.',
  },
  fascist: {
    title: 'Fascist',
    bgClass: 'fascist-board',
    textClass: 'text-red-400',
    tagline: 'Help Hitler and enact 6 Fascist policies.',
  },
  hitler: {
    title: 'Hitler',
    bgClass: 'fascist-board',
    textClass: 'text-red-300',
    tagline: 'Stay hidden. Get elected Chancellor after 3 Fascist policies.',
  },
} as const;

export default function RoleReveal() {
  const privateState = useGameStore((s) => s.privateState);
  const gameState = useGameStore((s) => s.gameState);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!privateState || !gameState) return null;

  const role = privateState.role;
  const config = roleConfig[role];

  const knownFascistNames = privateState.knownFascists
    .map((id) => gameState.players.find((p) => p.id === id)?.name)
    .filter(Boolean);

  const hitlerName = privateState.knownHitlerId
    ? gameState.players.find((p) => p.id === privateState.knownHitlerId)?.name
    : null;

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/90"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Role Card */}
        <div
          className={`w-64 ${config.bgClass} rounded-lg p-8 shadow-dramatic flex flex-col items-center gap-4`}
        >
          <div className="deco-rule w-32" />
          <h1 className={`text-3xl font-display font-black uppercase tracking-[0.2em] ${config.textClass}`}>
            {config.title}
          </h1>
          <p className="text-sm font-body text-parchment-200/70 text-center leading-relaxed">
            {config.tagline}
          </p>
          <div className="deco-rule w-32" />
        </div>

        {/* Known information */}
        {(role === 'fascist' || (role === 'hitler' && knownFascistNames.length > 0)) && (
          <Card className="max-w-sm text-center">
            {knownFascistNames.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-stone-500 mb-1">
                  Fellow Fascists
                </p>
                <p className="text-sm font-display font-bold text-red-400">
                  {knownFascistNames.join(', ')}
                </p>
              </div>
            )}
            {hitlerName && (
              <div>
                <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-stone-500 mb-1">
                  Hitler
                </p>
                <p className="text-sm font-display font-bold text-red-300">{hitlerName}</p>
              </div>
            )}
          </Card>
        )}

        {/* Countdown bar */}
        <div className="w-64 flex flex-col items-center gap-2">
          <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
            <motion.div
              className="h-full bg-amber-600 rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: COUNTDOWN_SECONDS, ease: 'linear' }}
            />
          </div>
          <p className="text-[10px] font-sans text-stone-600 tracking-wider">
            Memorize your role... {secondsLeft}s
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
