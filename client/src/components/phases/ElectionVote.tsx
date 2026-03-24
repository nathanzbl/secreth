import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import * as emitters from '../../lib/socketEmitters';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';

export default function ElectionVote() {
  const gameState = useGameStore((s) => s.gameState);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const addNotification = useGameStore((s) => s.addNotification);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!gameState || !myPlayerId) return null;

  const presidentName = gameState.players.find(
    (p) => p.id === gameState.currentPresidentId
  )?.name;
  const chancellorName = gameState.players.find(
    (p) => p.id === gameState.nominatedChancellorId
  )?.name;

  const myPlayer = gameState.players.find((p) => p.id === myPlayerId);
  const amDead = myPlayer?.status === 'dead';

  const aliveCount = gameState.players.filter((p) => p.status === 'alive').length;
  const votedCount = gameState.votedCount ?? 0;

  const handleVote = async (vote: boolean) => {
    setLoading(true);
    const error = await emitters.castVote(vote);
    setLoading(false);
    if (error) {
      addNotification(error, 'error');
    } else {
      setHasVoted(true);
    }
  };

  if (amDead) {
    return (
      <Card className="max-w-md mx-auto text-center">
        <p className="text-stone-600 font-display text-sm py-2">You are dead and cannot vote.</p>
        <p className="text-[10px] font-sans text-stone-700">
          Waiting for votes... {votedCount}/{aliveCount}
        </p>
      </Card>
    );
  }

  if (hasVoted) {
    return (
      <Card className="max-w-md mx-auto text-center">
        <div className="flex flex-col items-center gap-2 py-2 sm:gap-4 sm:py-4">
          <Spinner size="md" />
          <p className="text-parchment-200 text-sm sm:text-lg font-display">Vote cast!</p>
          <p className="text-[10px] font-sans text-stone-600">
            Waiting... {votedCount}/{aliveCount}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto" glow>
      <div className="flex flex-col items-center gap-3 sm:gap-5">
        <div className="text-center">
          <h2 className="text-base sm:text-xl font-display font-bold text-amber-500 tracking-wider uppercase">
            Vote
          </h2>
          <p className="text-xs sm:text-sm font-body text-stone-500 mt-1">
            <span className="font-display font-bold text-amber-500">{presidentName}</span>
            {' '}&amp;{' '}
            <span className="font-display font-bold text-amber-500">{chancellorName}</span>
          </p>
        </div>

        <div className="flex gap-4 sm:gap-6">
          <motion.button
            type="button"
            disabled={loading}
            onClick={() => handleVote(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-24 sm:min-w-[120px] py-2.5 sm:py-3 rounded-lg bg-parchment-50 text-stone-900
              font-display font-black text-xl sm:text-2xl tracking-wider uppercase
              border-2 border-amber-600/40 shadow-dramatic
              hover:bg-parchment-100 transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Ja!
          </motion.button>

          <motion.button
            type="button"
            disabled={loading}
            onClick={() => handleVote(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-24 sm:min-w-[120px] py-2.5 sm:py-3 rounded-lg bg-stone-800
              font-display font-black text-xl sm:text-2xl tracking-wider uppercase text-stone-300
              border-2 border-stone-600/40 shadow-dramatic
              hover:bg-stone-700 transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Nein
          </motion.button>
        </div>
      </div>
    </Card>
  );
}
