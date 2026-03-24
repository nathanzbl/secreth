import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import * as emitters from '../../lib/socketEmitters';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';

export default function ElectionNominate() {
  const gameState = useGameStore((s) => s.gameState);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const amPresident = useGameStore((s) => s.amPresident);
  const addNotification = useGameStore((s) => s.addNotification);
  const [loading, setLoading] = useState(false);

  if (!gameState || !myPlayerId) return null;

  const isPresident = amPresident();
  const presidentName = gameState.players.find(
    (p) => p.id === gameState.currentPresidentId
  )?.name;

  const alivePlayers = gameState.players.filter(
    (p) => p.status === 'alive' && p.id !== gameState.currentPresidentId
  );

  const aliveCount = gameState.players.filter((p) => p.status === 'alive').length;
  const lastGov = gameState.lastElectedGovernment;

  const eligible = alivePlayers.filter((p) => {
    if (!lastGov) return true;
    if (p.id === lastGov.chancellorId) return false;
    if (aliveCount > 5 && p.id === lastGov.presidentId) return false;
    return true;
  });

  const handleNominate = async (chancellorId: string) => {
    setLoading(true);
    const error = await emitters.nominateChancellor(chancellorId);
    setLoading(false);
    if (error) {
      addNotification(error, 'error');
    }
  };

  if (!isPresident) {
    return (
      <Card className="max-w-md mx-auto text-center">
        <div className="flex flex-col items-center gap-2 py-2 sm:gap-4 sm:py-4">
          <Spinner size="md" />
          <p className="text-parchment-200 text-sm sm:text-lg font-display">
            Waiting for <span className="font-bold text-amber-500">{presidentName}</span> to
            nominate a Chancellor...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto" glow>
      <div className="text-center mb-1">
        <h2 className="text-base sm:text-xl font-display font-bold text-amber-500 tracking-wider uppercase">
          Nominate a Chancellor
        </h2>
        <p className="text-xs sm:text-sm font-body text-stone-500 mt-0.5">
          Select a player to be your Chancellor candidate.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-2 sm:mt-4">
        {eligible.map((player) => (
          <motion.div key={player.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              variant="ghost"
              size="md"
              className="w-full"
              disabled={loading}
              onClick={() => handleNominate(player.id)}
            >
              {player.name}
            </Button>
          </motion.div>
        ))}
      </div>

      {eligible.length === 0 && (
        <p className="text-stone-600 font-body text-xs text-center py-2">
          No eligible candidates available.
        </p>
      )}
    </Card>
  );
}
