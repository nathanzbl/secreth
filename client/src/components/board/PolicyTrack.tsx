import { motion, AnimatePresence } from 'framer-motion';
import {
  getFascistBoardKey,
  FASCIST_BOARD_POWERS,
} from '../../../../shared/src/utils/constants';

const POWER_ICONS: Record<string, string> = {
  'policy-peek': '\u{1F441}',
  'investigate-loyalty': '\u{1F50E}',
  'special-election': '\u{2605}',
  'execution': '\u{2020}',
};

interface PolicyTrackProps {
  policyTrack: { liberal: number; fascist: number };
  playerCount: number;
}

function Slot({
  filled,
  isNew,
  type,
  icon,
}: {
  filled: boolean;
  isNew: boolean;
  type: 'liberal' | 'fascist';
  icon?: string;
}) {
  const enactedClass = type === 'liberal' ? 'policy-enacted-liberal' : 'policy-enacted-fascist';
  const letter = type === 'liberal' ? 'L' : 'F';
  const iconColor = type === 'liberal' ? 'text-blue-500/30' : 'text-red-500/30';

  return (
    <div className={`relative h-10 w-7 sm:h-12 sm:w-9 rounded ${filled ? '' : 'policy-slot'}`}>
      <AnimatePresence>
        {filled && (
          <motion.div
            initial={isNew ? { y: -30, opacity: 0, scale: 0.5 } : false}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`absolute inset-0 ${enactedClass} rounded flex items-center justify-center`}
          >
            <span className="text-white text-[9px] sm:text-[10px] font-display font-bold">{letter}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {icon && !filled && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${iconColor} text-sm sm:text-base`}>{icon}</span>
        </div>
      )}
    </div>
  );
}

export default function PolicyTrack({ policyTrack, playerCount }: PolicyTrackProps) {
  const boardKey = getFascistBoardKey(playerCount);
  const powers = FASCIST_BOARD_POWERS[boardKey];

  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-3 sm:justify-center">
      {/* Liberal board */}
      <div className="liberal-board rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] sm:text-xs font-display font-bold uppercase tracking-[0.12em] text-blue-300">Liberal</span>
          <span className="text-[9px] sm:text-[10px] text-blue-400/50 font-sans">{policyTrack.liberal}/5</span>
        </div>
        <div className="flex gap-1 sm:gap-1.5 justify-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Slot
              key={i}
              filled={i < policyTrack.liberal}
              isNew={i === policyTrack.liberal - 1}
              type="liberal"
              icon={i === 4 ? '\u2605' : undefined}
            />
          ))}
        </div>
      </div>

      {/* Fascist board */}
      <div className="fascist-board rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] sm:text-xs font-display font-bold uppercase tracking-[0.12em] text-red-400">Fascist</span>
          <span className="text-[9px] sm:text-[10px] text-red-400/50 font-sans">{policyTrack.fascist}/6</span>
        </div>
        <div className="flex gap-1 sm:gap-1.5 justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <Slot
              key={i}
              filled={i < policyTrack.fascist}
              isNew={i === policyTrack.fascist - 1}
              type="fascist"
              icon={powers[i] ? POWER_ICONS[powers[i]] : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
