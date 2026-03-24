import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import * as emitters from '../../lib/socketEmitters';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { PolicyTile } from '../ui/PolicyTile';
import type { PolicyType } from '../../../../shared/src/types/game';

export default function LegislativePresident() {
  const gameState = useGameStore((s) => s.gameState);
  const privateState = useGameStore((s) => s.privateState);
  const amPresident = useGameStore((s) => s.amPresident);
  const addNotification = useGameStore((s) => s.addNotification);
  const [loading, setLoading] = useState(false);
  const [discardedIndex, setDiscardedIndex] = useState<number | null>(null);

  if (!gameState) return null;

  const isPresident = amPresident();
  const presidentName = gameState.players.find(
    (p) => p.id === gameState.currentPresidentId
  )?.name;

  if (!isPresident) {
    return (
      <Card className="max-w-md mx-auto text-center">
        <div className="flex flex-col items-center gap-2 py-2 sm:gap-4 sm:py-4">
          <Spinner size="md" />
          <p className="text-parchment-200 text-sm sm:text-lg font-display">
            <span className="font-bold text-amber-500">{presidentName}</span> is examining policies...
          </p>
        </div>
      </Card>
    );
  }

  const policies: PolicyType[] = privateState?.policyChoices ?? [];

  if (policies.length === 0) {
    return (
      <Card className="max-w-md mx-auto text-center">
        <div className="flex flex-col items-center gap-2 py-2">
          <Spinner size="md" />
          <p className="text-parchment-200 text-sm font-display">Receiving policies...</p>
        </div>
      </Card>
    );
  }

  const handleDiscard = async (index: number) => {
    setDiscardedIndex(index);
    setLoading(true);
    const error = await emitters.presidentDiscard(index);
    setLoading(false);
    if (error) {
      setDiscardedIndex(null);
      addNotification(error, 'error');
    }
  };

  return (
    <Card className="max-w-lg mx-auto" glow>
      <div className="flex flex-col items-center gap-3 sm:gap-5">
        <div className="text-center">
          <h2 className="text-base sm:text-xl font-display font-bold text-amber-500 tracking-wider uppercase">
            Legislative Session
          </h2>
          <p className="text-xs sm:text-sm font-body text-stone-500 mt-0.5">
            Tap a policy to <span className="font-display font-bold text-red-400">discard</span> it.
          </p>
        </div>

        <div className="flex gap-2 sm:gap-4 justify-center">
          {policies.map((policy, i) => (
            <motion.button
              key={i}
              type="button"
              disabled={loading || discardedIndex !== null}
              onClick={() => handleDiscard(i)}
              whileHover={
                loading || discardedIndex !== null
                  ? undefined
                  : { scale: 1.06, y: -5 }
              }
              whileTap={
                loading || discardedIndex !== null
                  ? undefined
                  : { scale: 0.95 }
              }
              className={`cursor-pointer transition-opacity ${
                discardedIndex === i ? 'opacity-30' : ''
              } ${loading ? 'cursor-not-allowed' : ''}`}
            >
              <PolicyTile type={policy} size="lg" />
            </motion.button>
          ))}
        </div>
      </div>
    </Card>
  );
}
