import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { Card } from '../ui/Card';
import { BallotCard } from '../ui/BallotCard';

export default function ElectionResult() {
  const gameState = useGameStore((s) => s.gameState);
  const voteReveal = useGameStore((s) => s.voteReveal);

  if (!gameState) return null;

  const votes = voteReveal?.votes ?? gameState.votes;
  const result = voteReveal?.result ?? gameState.voteResult;

  if (!votes || !result) return null;

  const jaCount = Object.values(votes).filter(Boolean).length;
  const neinCount = Object.values(votes).filter((v) => !v).length;
  const passed = result === 'passed';

  return (
    <Card className="max-w-lg mx-auto" glow>
      <div className="flex flex-col items-center gap-3 sm:gap-5">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-center"
        >
          <h2
            className={`text-2xl sm:text-3xl font-display font-black uppercase tracking-[0.15em] ${
              passed ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {passed ? 'PASSED' : 'FAILED'}
          </h2>
          <p className="text-[10px] sm:text-xs font-sans text-stone-500 tracking-wider">
            {jaCount} Ja / {neinCount} Nein
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {gameState.players
            .filter((p) => p.status === 'alive')
            .map((player, i) => {
              const vote = votes[player.id];
              if (vote === undefined) return null;

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex flex-col items-center gap-1"
                >
                  <p className="text-[10px] sm:text-sm font-display font-bold text-parchment-200 truncate max-w-[70px] sm:max-w-[100px]">
                    {player.name}
                  </p>
                  <BallotCard vote={vote ? 'ja' : 'nein'} revealed size="sm" />
                </motion.div>
              );
            })}
        </div>

        <p className="text-[9px] font-sans text-stone-700 tracking-wider animate-pulse">
          Continuing...
        </p>
      </div>
    </Card>
  );
}
