import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import * as emitters from '../../lib/socketEmitters';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { PolicyTile } from '../ui/PolicyTile';
import type { PolicyType } from '../../../../shared/src/types/game';

export default function LegislativeChancellor() {
  const gameState = useGameStore((s) => s.gameState);
  const privateState = useGameStore((s) => s.privateState);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const amChancellor = useGameStore((s) => s.amChancellor);
  const addNotification = useGameStore((s) => s.addNotification);
  const [loading, setLoading] = useState(false);
  const [enactedIndex, setEnactedIndex] = useState<number | null>(null);
  const [vetoRequested, setVetoRequested] = useState(false);
  const [vetoResponded, setVetoResponded] = useState(false);

  if (!gameState) return null;

  const isChancellor = amChancellor();
  const isPresident = myPlayerId === gameState.currentPresidentId;
  const chancellorName = gameState.players.find(
    (p) => p.id === gameState.nominatedChancellorId
  )?.name;

  const handleVetoResponse = async (approve: boolean) => {
    setLoading(true);
    const error = await emitters.respondToVeto(approve);
    setLoading(false);
    if (error) {
      addNotification(error, 'error');
    } else {
      setVetoResponded(true);
    }
  };

  if (!isChancellor && isPresident && gameState.vetoRequested) {
    return (
      <Card className="max-w-md mx-auto" glow>
        <div className="flex flex-col items-center gap-2 sm:gap-4 py-2 sm:py-4">
          <h2 className="text-base sm:text-xl font-display font-bold text-red-400 tracking-wider uppercase">Veto Requested</h2>
          <p className="text-xs sm:text-sm font-body text-stone-500 text-center">
            <span className="font-display font-bold text-amber-500">{chancellorName}</span> wants to veto. Agree?
          </p>
          {vetoResponded ? (
            <Spinner size="md" />
          ) : (
            <div className="flex gap-3">
              <Button variant="success" size="md" disabled={loading} loading={loading} onClick={() => handleVetoResponse(true)}>
                Approve
              </Button>
              <Button variant="danger" size="md" disabled={loading} loading={loading} onClick={() => handleVetoResponse(false)}>
                Reject
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  }

  if (!isChancellor) {
    return (
      <Card className="max-w-md mx-auto text-center">
        <div className="flex flex-col items-center gap-2 py-2 sm:gap-4 sm:py-4">
          <Spinner size="md" />
          <p className="text-parchment-200 text-sm sm:text-lg font-display">
            <span className="font-bold text-amber-500">{chancellorName}</span> is enacting...
          </p>
        </div>
      </Card>
    );
  }

  const policies: PolicyType[] = privateState?.policyChoices ?? [];
  const vetoEnabled = gameState.policyTrack.fascist >= 5;

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

  const handleEnact = async (index: number) => {
    setEnactedIndex(index);
    setLoading(true);
    const error = await emitters.chancellorEnact(index);
    setLoading(false);
    if (error) {
      setEnactedIndex(null);
      addNotification(error, 'error');
    }
  };

  const handleVeto = async () => {
    setVetoRequested(true);
    setLoading(true);
    const error = await emitters.requestVeto();
    setLoading(false);
    if (error) {
      setVetoRequested(false);
      addNotification(error, 'error');
    }
  };

  if (vetoRequested) {
    return (
      <Card className="max-w-md mx-auto text-center">
        <div className="flex flex-col items-center gap-2 py-2">
          <Spinner size="md" />
          <p className="text-parchment-200 text-sm font-display">
            Veto requested. Waiting for President...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto" glow>
      <div className="flex flex-col items-center gap-3 sm:gap-5">
        <div className="text-center">
          <h2 className="text-base sm:text-xl font-display font-bold text-amber-500 tracking-wider uppercase">
            Enact a Policy
          </h2>
          <p className="text-xs sm:text-sm font-body text-stone-500 mt-0.5">
            Tap a policy to <span className="font-display font-bold text-green-500">enact</span> it.
          </p>
        </div>

        <div className="flex gap-3 sm:gap-6 justify-center">
          {policies.map((policy, i) => (
            <motion.button
              key={i}
              type="button"
              disabled={loading || enactedIndex !== null}
              onClick={() => handleEnact(i)}
              whileHover={
                loading || enactedIndex !== null
                  ? undefined
                  : { scale: 1.06, y: -5 }
              }
              whileTap={
                loading || enactedIndex !== null
                  ? undefined
                  : { scale: 0.95 }
              }
              className={`cursor-pointer transition-opacity ${
                enactedIndex !== null && enactedIndex !== i ? 'opacity-30' : ''
              } ${loading ? 'cursor-not-allowed' : ''}`}
            >
              <PolicyTile type={policy} size="lg" />
            </motion.button>
          ))}
        </div>

        {vetoEnabled && (
          <div className="border-t border-stone-800/60 pt-2 w-full flex flex-col items-center gap-1">
            <p className="text-[9px] font-sans text-stone-600 tracking-wider uppercase">
              Veto power active
            </p>
            <Button variant="danger" size="sm" disabled={loading} onClick={handleVeto}>
              Propose Veto
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
