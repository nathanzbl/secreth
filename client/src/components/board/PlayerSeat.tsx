import type { Player } from '../../../../shared/src/types/game';

interface PlayerSeatProps {
  player: Player;
  isPresident: boolean;
  isChancellor: boolean;
  isNominated: boolean;
  isYou: boolean;
  vote: boolean | null;
  isSelectable: boolean;
  isSelected: boolean;
  onSelect?: (playerId: string) => void;
  isDead: boolean;
}

function RoleBadge({ label, variant }: { label: string; variant: 'president' | 'chancellor' | 'nominated' | 'you' }) {
  const styles = {
    president: 'bg-amber-800/80 text-amber-200 border-amber-600/60',
    chancellor: 'bg-amber-700/70 text-amber-100 border-amber-500/50',
    nominated: 'bg-stone-700/60 text-amber-300/80 border-amber-600/30',
    you: 'bg-stone-800/60 text-stone-400 border-stone-600/40',
  };

  return (
    <span className={`inline-block rounded px-1 py-px text-[6px] sm:text-[8px] font-sans font-bold uppercase tracking-wide border leading-none ${styles[variant]}`}>
      {label}
    </span>
  );
}

export default function PlayerSeat({
  player,
  isPresident,
  isChancellor,
  isNominated,
  isYou,
  vote,
  isSelectable,
  isSelected,
  onSelect,
  isDead,
}: PlayerSeatProps) {
  const ringClass = isSelected
    ? 'ring-2 ring-amber-500'
    : isSelectable
      ? 'ring-1 ring-amber-600/40 cursor-pointer hover:ring-2 hover:ring-amber-500'
      : '';

  return (
    <button
      type="button"
      disabled={!isSelectable}
      onClick={() => isSelectable && onSelect?.(player.id)}
      className={`
        relative flex flex-col items-center gap-px sm:gap-0.5 rounded
        bg-stone-900/80 border border-stone-700/50
        px-1.5 py-1 sm:px-2.5 sm:py-1.5 transition-all
        min-w-[44px] sm:min-w-[60px] flex-shrink-0
        ${ringClass}
        ${isSelectable ? '' : 'cursor-default'}
        ${isDead ? 'opacity-40' : ''}
      `}
    >
      {isDead && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded bg-stone-950/50">
          <span className="text-sm sm:text-lg opacity-50">{'\u2020'}</span>
        </div>
      )}

      <div
        className={`absolute right-0.5 top-0.5 h-1 w-1 rounded-full ${
          player.isConnected ? 'bg-green-600' : 'bg-stone-700'
        }`}
      />

      <span
        className={`text-[10px] sm:text-xs font-display font-bold leading-none ${
          isDead ? 'text-stone-600 line-through' : 'text-parchment-100'
        } ${isYou ? 'text-amber-300' : ''}`}
      >
        {player.name}
      </span>

      <div className="flex flex-wrap justify-center gap-px">
        {isPresident && <RoleBadge label="Pres" variant="president" />}
        {isChancellor && <RoleBadge label="Chan" variant="chancellor" />}
        {isNominated && !isChancellor && <RoleBadge label="Nom" variant="nominated" />}
        {isYou && <RoleBadge label="You" variant="you" />}
      </div>

      {vote !== null && (
        <div
          className={`rounded px-1 py-px text-[7px] sm:text-[9px] font-display font-bold tracking-wide leading-none ${
            vote
              ? 'bg-green-900/60 text-green-300'
              : 'bg-red-900/60 text-red-300'
          }`}
        >
          {vote ? 'Ja' : 'Nein'}
        </div>
      )}
    </button>
  );
}
