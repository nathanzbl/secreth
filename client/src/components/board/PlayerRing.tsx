import type { Player, GameState } from '../../../../shared/src/types/game';
import PlayerSeat from './PlayerSeat';

interface PlayerRingProps {
  players: Player[];
  gameState: GameState;
  myPlayerId: string;
  selectedPlayerId: string | null;
  selectablePlayerIds: string[];
  onSelectPlayer: (playerId: string) => void;
  votes: Record<string, boolean> | null;
}

export default function PlayerRing({
  players,
  gameState,
  myPlayerId,
  selectedPlayerId,
  selectablePlayerIds,
  onSelectPlayer,
  votes,
}: PlayerRingProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-1.5 px-1.5 sm:mx-0 sm:px-0">
      <div className="flex gap-1 sm:gap-2 sm:flex-wrap sm:justify-center min-w-max sm:min-w-0">
        {players.map((player) => (
          <PlayerSeat
            key={player.id}
            player={player}
            isPresident={gameState.currentPresidentId === player.id}
            isChancellor={
              gameState.lastElectedGovernment?.chancellorId === player.id &&
              gameState.phase !== 'election-nominate' &&
              gameState.phase !== 'election-vote'
            }
            isNominated={gameState.nominatedChancellorId === player.id}
            isYou={player.id === myPlayerId}
            vote={votes?.[player.id] ?? null}
            isSelectable={selectablePlayerIds.includes(player.id)}
            isSelected={selectedPlayerId === player.id}
            onSelect={onSelectPlayer}
            isDead={player.status === 'dead'}
          />
        ))}
      </div>
    </div>
  );
}
