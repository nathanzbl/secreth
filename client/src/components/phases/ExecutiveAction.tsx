import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import * as emitters from '../../lib/socketEmitters';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { PolicyTile } from '../ui/PolicyTile';
import type { ExecutivePower, PolicyType } from '../../../../shared/src/types/game';

const POWER_TITLES: Record<ExecutivePower, string> = {
  'policy-peek': 'Policy Peek',
  'investigate-loyalty': 'Investigate Loyalty',
  'special-election': 'Special Election',
  execution: 'Execution',
};

const POWER_DESCRIPTIONS: Record<ExecutivePower, string> = {
  'policy-peek': 'View the top 3 cards of the policy deck.',
  'investigate-loyalty': 'Choose a player to investigate.',
  'special-election': 'Choose the next Presidential candidate.',
  execution: 'Choose a player to execute.',
};

export default function ExecutiveAction() {
  const gameState = useGameStore((s) => s.gameState);
  const privateState = useGameStore((s) => s.privateState);
  const amPresident = useGameStore((s) => s.amPresident);
  const investigationResult = useGameStore((s) => s.investigationResult);

  if (!gameState) return null;

  const isPresident = amPresident();
  const power = gameState.pendingExecutivePower;
  const presidentName = gameState.players.find(
    (p) => p.id === gameState.currentPresidentId
  )?.name;

  if (!power) return null;

  if (!isPresident) {
    return (
      <Card className="max-w-md mx-auto text-center">
        <div className="flex flex-col items-center gap-2 py-2 sm:gap-4 sm:py-4">
          <Spinner size="md" />
          <p className="text-parchment-200 text-sm sm:text-lg font-display">
            <span className="font-bold text-amber-500">{presidentName}</span> is using executive power...
          </p>
          <p className="text-[10px] font-sans text-stone-600 tracking-wider uppercase">{POWER_TITLES[power]}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto" glow>
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <h2 className="text-base sm:text-xl font-display font-bold text-amber-500 tracking-wider uppercase">
          {POWER_TITLES[power]}
        </h2>
        <p className="text-xs sm:text-sm font-body text-stone-500 text-center">
          {POWER_DESCRIPTIONS[power]}
        </p>
      </div>

      {power === 'policy-peek' && (
        <PolicyPeekView policies={privateState?.policyPeek ?? []} />
      )}
      {power === 'investigate-loyalty' && (
        <InvestigateView investigationResult={investigationResult} />
      )}
      {power === 'special-election' && <SpecialElectionView />}
      {power === 'execution' && <ExecutionView />}
    </Card>
  );
}

function PolicyPeekView({ policies }: { policies: PolicyType[] }) {
  const addNotification = useGameStore((s) => s.addNotification);
  const [loading, setLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const handleAcknowledge = async () => {
    setLoading(true);
    const error = await emitters.acknowledgePeek();
    setLoading(false);
    if (error) {
      addNotification(error, 'error');
    } else {
      setAcknowledged(true);
    }
  };

  if (policies.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-3">
        <Spinner />
        <p className="text-stone-500 text-xs font-body">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-5 py-2 sm:py-4">
      <p className="text-[10px] font-sans text-stone-600 tracking-wider">Top 3 (left = top):</p>
      <div className="flex gap-2 sm:gap-4 justify-center">
        {policies.map((policy, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <PolicyTile type={policy} size="md" />
          </motion.div>
        ))}
      </div>
      <Button
        variant="primary"
        size="sm"
        disabled={loading || acknowledged}
        loading={loading}
        onClick={handleAcknowledge}
      >
        {acknowledged ? 'Done' : 'Got it'}
      </Button>
    </div>
  );
}

function InvestigateView({
  investigationResult,
}: {
  investigationResult: { targetId: string; party: string } | null;
}) {
  const gameState = useGameStore((s) => s.gameState);
  const addNotification = useGameStore((s) => s.addNotification);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  if (!gameState) return null;

  if (investigationResult) {
    const targetName = gameState.players.find(
      (p) => p.id === investigationResult.targetId
    )?.name;
    const isLib = investigationResult.party === 'liberal';

    const handleAcknowledge = async () => {
      setLoading(true);
      const error = await emitters.acknowledgeInvestigation();
      setLoading(false);
      if (error) {
        addNotification(error, 'error');
      } else {
        setAcknowledged(true);
      }
    };

    return (
      <div className="flex flex-col items-center gap-3 py-3 sm:py-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`rounded-lg px-5 py-3 sm:px-8 sm:py-4 border-2 ${
            isLib ? 'liberal-board border-blue-500/50' : 'fascist-board border-red-500/50'
          }`}
        >
          <p className="text-center font-body text-sm sm:text-base">
            <span className="font-display font-bold text-parchment-100">{targetName}</span> is{' '}
            <span className={`font-display font-black uppercase ${isLib ? 'text-blue-400' : 'text-red-400'}`}>
              {investigationResult.party}
            </span>
          </p>
        </motion.div>
        <Button
          variant="primary"
          size="sm"
          disabled={loading || acknowledged}
          loading={loading}
          onClick={handleAcknowledge}
        >
          {acknowledged ? 'Done' : 'Got it'}
        </Button>
      </div>
    );
  }

  const eligible = gameState.players.filter(
    (p) => p.status === 'alive' && p.id !== gameState.currentPresidentId
  );

  const handleInvestigate = async (targetId: string) => {
    setSelectedId(targetId);
    setLoading(true);
    const error = await emitters.investigate(targetId);
    setLoading(false);
    if (error) {
      setSelectedId(null);
      addNotification(error, 'error');
    }
  };

  return (
    <div className="py-2 sm:py-4">
      <div className="grid grid-cols-2 gap-2">
        {eligible.map((player) => (
          <Button
            key={player.id}
            variant="ghost"
            size="md"
            disabled={loading}
            className={selectedId === player.id ? 'ring-2 ring-amber-600' : ''}
            onClick={() => handleInvestigate(player.id)}
          >
            {player.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

function SpecialElectionView() {
  const gameState = useGameStore((s) => s.gameState);
  const addNotification = useGameStore((s) => s.addNotification);
  const [loading, setLoading] = useState(false);

  if (!gameState) return null;

  const eligible = gameState.players.filter(
    (p) => p.status === 'alive' && p.id !== gameState.currentPresidentId
  );

  const handleSelect = async (targetId: string) => {
    setLoading(true);
    const error = await emitters.specialElection(targetId);
    setLoading(false);
    if (error) {
      addNotification(error, 'error');
    }
  };

  return (
    <div className="py-2 sm:py-4">
      <div className="grid grid-cols-2 gap-2">
        {eligible.map((player) => (
          <Button
            key={player.id}
            variant="ghost"
            size="md"
            disabled={loading}
            onClick={() => handleSelect(player.id)}
          >
            {player.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

function ExecutionView() {
  const gameState = useGameStore((s) => s.gameState);
  const addNotification = useGameStore((s) => s.addNotification);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!gameState) return null;

  const eligible = gameState.players.filter(
    (p) => p.status === 'alive' && p.id !== gameState.currentPresidentId
  );

  const selectedName = selectedId
    ? gameState.players.find((p) => p.id === selectedId)?.name
    : null;

  const handleExecute = async () => {
    if (!selectedId) return;
    setLoading(true);
    const error = await emitters.executePlayer(selectedId);
    setLoading(false);
    if (error) {
      addNotification(error, 'error');
      setConfirming(false);
      setSelectedId(null);
    }
  };

  if (confirming && selectedId) {
    return (
      <div className="flex flex-col items-center gap-3 sm:gap-5 py-3 sm:py-5">
        <p className="text-sm sm:text-lg font-display text-parchment-100 text-center">
          Execute <span className="font-black text-red-400">{selectedName}</span>?
        </p>
        <div className="flex gap-3">
          <Button variant="danger" size="md" disabled={loading} loading={loading} onClick={handleExecute}>
            Confirm
          </Button>
          <Button
            variant="ghost"
            size="md"
            disabled={loading}
            onClick={() => { setConfirming(false); setSelectedId(null); }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 sm:py-4">
      <div className="grid grid-cols-2 gap-2">
        {eligible.map((player) => (
          <Button
            key={player.id}
            variant="danger"
            size="md"
            disabled={loading}
            onClick={() => { setSelectedId(player.id); setConfirming(true); }}
          >
            {player.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
