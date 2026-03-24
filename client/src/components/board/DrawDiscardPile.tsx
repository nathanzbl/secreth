interface DrawDiscardPileProps {
  drawCount: number;
  discardCount: number;
}

export default function DrawDiscardPile({ drawCount, discardCount }: DrawDiscardPileProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-1">
        <span className="text-[7px] sm:text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-stone-600">
          Draw
        </span>
        <span className="text-[10px] sm:text-xs font-display font-bold text-stone-400 bg-stone-900/80 border border-stone-700/50 rounded px-1.5 py-0.5 min-w-[20px] text-center">
          {drawCount}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[7px] sm:text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-stone-600">
          Disc
        </span>
        <span className="text-[10px] sm:text-xs font-display font-bold text-stone-500 bg-stone-900/80 border border-stone-700/50 rounded px-1.5 py-0.5 min-w-[20px] text-center">
          {discardCount}
        </span>
      </div>
    </div>
  );
}
