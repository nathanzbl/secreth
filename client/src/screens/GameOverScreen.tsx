import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import * as emitters from '../lib/socketEmitters';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import type { WinCondition } from '../../../shared/src/types/game';

const WIN_CONDITION_TEXT: Record<WinCondition, string> = {
  'liberals-policies': 'The Liberals enacted 5 Liberal policies.',
  'liberals-hitler-killed': 'Hitler was assassinated.',
  'fascists-policies': 'The Fascists enacted 6 Fascist policies.',
  'fascists-hitler-elected': 'Hitler was elected Chancellor after 3 Fascist policies.',
};

export default function GameOverScreen() {
  const gameOverData = useGameStore((s) => s.gameOverData);
  const gameState = useGameStore((s) => s.gameState);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const reset = useGameStore((s) => s.reset);
  const addNotification = useGameStore((s) => s.addNotification);
  const setGameOverData = useGameStore((s) => s.setGameOverData);
  const [restartLoading, setRestartLoading] = useState(false);

  if (!gameOverData || !gameState) return null;

  const { result, roles } = gameOverData;
  const isLiberalWin = result.winner === 'liberals';
  const isHost = myPlayerId === gameState.hostId;

  const handleRestart = async () => {
    setRestartLoading(true);
    const error = await emitters.restartGame();
    setRestartLoading(false);
    if (error) {
      addNotification(error, 'error');
    } else {
      // Clear game over state so we go back to lobby
      setGameOverData(null);
    }
  };

  const handleLeave = async () => {
    if (isHost) {
      const error = await emitters.dismissRoom();
      if (error) addNotification(error, 'error');
      // room:dismissed listener will call reset() for everyone
    } else {
      reset();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-propaganda p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="flex flex-col items-center gap-6 w-full max-w-lg"
      >
        {/* Winner announcement */}
        <div className="text-center">
          <div className="deco-rule w-40 mx-auto mb-4" />
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-4xl font-display font-black uppercase tracking-[0.2em] ${
              isLiberalWin ? 'text-blue-400' : 'text-red-500'
            }`}
          >
            {isLiberalWin ? 'Liberals Win' : 'Fascists Win'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-stone-500 mt-2 text-sm font-display italic"
          >
            {WIN_CONDITION_TEXT[result.condition]}
          </motion.p>
          <div className="deco-rule w-40 mx-auto mt-4" />
        </div>

        {/* All roles revealed */}
        <Card className="w-full">
          <h2 className="font-display text-base font-bold text-parchment-100 mb-3 text-center tracking-wider uppercase">
            All Roles Revealed
          </h2>
          <div className="flex flex-col gap-1.5">
            {gameState.players.map((player, i) => {
              const roleInfo = roles[player.id];
              if (!roleInfo) return null;

              const roleName = roleInfo.role as string;
              const badgeVariant =
                roleName === 'hitler'
                  ? 'hitler'
                  : roleName === 'fascist'
                    ? 'fascist'
                    : 'liberal';

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center justify-between rounded-md bg-stone-800/40 border border-stone-800/30 px-4 py-2.5"
                >
                  <span
                    className={`text-sm font-display font-bold ${
                      player.status === 'dead'
                        ? 'text-stone-600 line-through'
                        : 'text-parchment-100'
                    }`}
                  >
                    {player.name}
                    {player.status === 'dead' && (
                      <span className="text-stone-700 ml-2 text-[10px] font-sans">(dead)</span>
                    )}
                  </span>
                  <Badge variant={badgeVariant}>
                    {roleName.toUpperCase()}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full">
          {isHost ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              loading={restartLoading}
              disabled={restartLoading}
              onClick={handleRestart}
            >
              Play Again — Same Room
            </Button>
          ) : (
            <p className="text-stone-600 text-xs font-sans text-center tracking-wider">
              Waiting for host to restart...
            </p>
          )}
          <Button
            variant="ghost"
            size="md"
            className="w-full"
            onClick={handleLeave}
          >
            Leave
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
