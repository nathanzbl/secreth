import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameLogEntry } from '../../../../shared/src/types/game';

interface GameLogToggleProps {
  open: boolean;
  onToggle: () => void;
  hasEntries: boolean;
}

export function GameLogToggle({ open, onToggle, hasEntries }: GameLogToggleProps) {
  if (!hasEntries) return null;

  return (
    <button
      onClick={onToggle}
      className={`
        px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.12em]
        border transition-all cursor-pointer leading-none
        ${open
          ? 'bg-amber-900/40 text-amber-400 border-amber-700/40'
          : 'bg-stone-900/70 text-stone-500 border-stone-700/40 hover:text-stone-300'
        }
      `}
    >
      {open ? 'Hide Log' : 'Game Log'}
    </button>
  );
}

interface InvestigationRecord {
  targetName: string;
  party: string;
  round: number;
}

interface GameLogPanelProps {
  entries: GameLogEntry[];
  open: boolean;
  investigationHistory?: InvestigationRecord[];
}

function formatEntry(entry: GameLogEntry): string {
  switch (entry.type) {
    case 'election-passed':
      return `${entry.presidentName} (Pres) + ${entry.chancellorName} (Chan) — elected ${entry.votesYes}–${entry.votesNo}`;
    case 'election-failed':
      return `${entry.presidentName} (Pres) + ${entry.chancellorName} (Chan) — rejected ${entry.votesYes}–${entry.votesNo}`;
    case 'policy-enacted':
      return `${entry.policy === 'liberal' ? 'Liberal' : 'Fascist'} policy enacted`;
    case 'chaos-policy':
      return `Chaos! ${entry.policy === 'liberal' ? 'Liberal' : 'Fascist'} policy enacted from deck`;
    case 'execution':
      return `${entry.presidentName} executed ${entry.targetName}`;
    case 'investigation':
      return `${entry.presidentName} investigated ${entry.targetName}`;
    case 'special-election':
      return `${entry.presidentName} called special election → ${entry.targetName}`;
    case 'veto-approved':
      return `Agenda vetoed by ${entry.presidentName} & ${entry.chancellorName}`;
    default:
      return '';
  }
}

function entryIcon(entry: GameLogEntry): string {
  switch (entry.type) {
    case 'election-passed': return '✓';
    case 'election-failed': return '✗';
    case 'policy-enacted': return entry.policy === 'liberal' ? 'L' : 'F';
    case 'chaos-policy': return '⚡';
    case 'execution': return '†';
    case 'investigation': return '🔎';
    case 'special-election': return '★';
    case 'veto-approved': return '⊘';
    default: return '·';
  }
}

function entryColor(entry: GameLogEntry): string {
  switch (entry.type) {
    case 'election-passed': return 'text-green-500';
    case 'election-failed': return 'text-red-400/70';
    case 'policy-enacted':
    case 'chaos-policy':
      return entry.policy === 'liberal' ? 'text-blue-400' : 'text-red-400';
    case 'execution': return 'text-red-400';
    case 'investigation': return 'text-amber-400';
    case 'special-election': return 'text-amber-400';
    case 'veto-approved': return 'text-stone-400';
    default: return 'text-stone-500';
  }
}

function VoteBreakdown({ playerVotes }: { playerVotes: Record<string, boolean> }) {
  const ja = Object.entries(playerVotes).filter(([, v]) => v);
  const nein = Object.entries(playerVotes).filter(([, v]) => !v);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="overflow-hidden"
    >
      <div className="pl-5 pt-0.5 pb-0.5 flex flex-wrap gap-x-4 gap-y-0.5">
        {ja.length > 0 && (
          <div>
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-green-500/70">Ja </span>
            <span className="text-[10px] font-sans text-stone-400">
              {ja.map(([name]) => name).join(', ')}
            </span>
          </div>
        )}
        {nein.length > 0 && (
          <div>
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-red-400/70">Nein </span>
            <span className="text-[10px] font-sans text-stone-400">
              {nein.map(([name]) => name).join(', ')}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function LogEntry({ entry, investigatedParty }: { entry: GameLogEntry; investigatedParty?: string }) {
  const [expanded, setExpanded] = useState(false);
  const hasVotes = entry.playerVotes && Object.keys(entry.playerVotes).length > 0;
  const isElection = entry.type === 'election-passed' || entry.type === 'election-failed';
  const clickable = isElection && hasVotes;

  return (
    <div>
      <div
        className={`flex items-start gap-1.5 ${clickable ? 'cursor-pointer active:opacity-70' : ''}`}
        onClick={() => clickable && setExpanded(!expanded)}
      >
        <span className={`text-[11px] font-mono w-3.5 shrink-0 text-center leading-[1.5] ${entryColor(entry)}`}>
          {entryIcon(entry)}
        </span>
        <p className="text-[11px] font-sans text-stone-300 leading-[1.5] flex-1">
          {formatEntry(entry)}
          {investigatedParty && (
            <span className={`ml-1 font-bold ${investigatedParty === 'liberal' ? 'text-blue-400' : 'text-red-400'}`}>
              ({investigatedParty})
            </span>
          )}
        </p>
        {clickable && (
          <span className="text-[9px] text-stone-600 shrink-0 mt-0.5 leading-[1.5]">
            {expanded ? '▾' : '▸'}
          </span>
        )}
      </div>
      <AnimatePresence>
        {expanded && entry.playerVotes && (
          <VoteBreakdown playerVotes={entry.playerVotes} />
        )}
      </AnimatePresence>
    </div>
  );
}

export function GameLogPanel({ entries, open, investigationHistory }: GameLogPanelProps) {
  if (entries.length === 0) return null;

  // Build a lookup for private investigation results by round+target
  const investigationLookup = new Map<string, string>();
  if (investigationHistory) {
    for (const inv of investigationHistory) {
      investigationLookup.set(`${inv.round}:${inv.targetName}`, inv.party);
    }
  }

  // Group entries by round
  const rounds = new Map<number, GameLogEntry[]>();
  for (const entry of entries) {
    const arr = rounds.get(entry.round) ?? [];
    arr.push(entry);
    rounds.set(entry.round, arr);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="rounded-lg bg-stone-950/80 border border-stone-800/50 mx-1 sm:mx-0 mb-1.5 max-h-[35vh] overflow-y-auto scrollbar-hide">
            <div className="px-3 py-2 flex flex-col gap-2">
              {[...rounds.entries()].map(([round, roundEntries]) => (
                <div key={round}>
                  <p className="text-[9px] font-sans font-bold uppercase tracking-[0.18em] text-stone-500 mb-0.5">
                    Round {round}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {roundEntries.map((entry, i) => {
                      const party = entry.type === 'investigation' && entry.targetName
                        ? investigationLookup.get(`${entry.round}:${entry.targetName}`)
                        : undefined;
                      return <LogEntry key={i} entry={entry} investigatedParty={party} />;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
