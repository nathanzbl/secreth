import { motion } from 'framer-motion';

interface ElectionTrackerProps {
  count: number; // 0-3
}

export default function ElectionTracker({ count }: ElectionTrackerProps) {
  const isWarning = count === 2;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <span className="text-[7px] sm:text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-stone-600">
        Tracker
      </span>
      {[0, 1, 2].map((i) => {
        const filled = i < count;
        return (
          <motion.div
            key={i}
            animate={
              isWarning && filled
                ? {
                    boxShadow: [
                      '0 0 0px rgba(220,38,38,0)',
                      '0 0 8px rgba(220,38,38,0.5)',
                      '0 0 0px rgba(220,38,38,0)',
                    ],
                  }
                : {}
            }
            transition={
              isWarning && filled
                ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                : {}
            }
            className={`h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 rounded-full border-[1.5px] sm:border-2 transition-all duration-300 ${
              filled
                ? 'border-red-600 bg-red-700 shadow-glow-red'
                : 'border-stone-700 bg-stone-900'
            }`}
          />
        );
      })}
      {isWarning && (
        <span className="text-[7px] sm:text-[8px] text-red-500/80 font-sans animate-pulse ml-0.5">
          !
        </span>
      )}
    </div>
  );
}
