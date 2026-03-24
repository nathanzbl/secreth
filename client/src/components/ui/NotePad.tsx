import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// font-size 16px prevents iOS Safari from auto-zooming on textarea focus.
// Line height must match the repeating-gradient interval exactly so ruled
// lines stay under each row of text as the textarea scrolls
// (achieved via background-attachment: local).
const FONT_SIZE = 16;
const LINE_H = 28;

export function NotePadToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
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
      {open ? 'Hide Notes' : 'Notes'}
    </button>
  );
}

// Notes are intentionally local state — they persist only for the current
// session and are cleared when the component unmounts (i.e. the game ends).
export function NotePadPanel({ open }: { open: boolean }) {
  const [notes, setNotes] = useState('');

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
          <div
            className="mx-1 sm:mx-0 mb-1.5 rounded overflow-hidden"
            style={{ boxShadow: '0 3px 14px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.3)' }}
          >
            {/* ─── Pad header: amber strip + spiral holes ─── */}
            <div
              className="flex items-center justify-between px-3 py-1"
              style={{ backgroundColor: '#f59e0b', borderBottom: '1.5px solid #b45309' }}
            >
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-amber-950/55">
                Notes
              </span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'rgba(92,45,0,0.28)', border: '1px solid rgba(92,45,0,0.42)' }}
                  />
                ))}
              </div>
            </div>

            {/* ─── Writing area ─── */}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="your notes…"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="sentences"
              style={{
                display: 'block',
                width: '100%',
                resize: 'none',
                border: 'none',
                outline: 'none',
                WebkitAppearance: 'none',
                fontSize: FONT_SIZE,
                lineHeight: `${LINE_H}px`,
                minHeight: `${LINE_H * 5}px`,
                maxHeight: `${LINE_H * 8}px`,
                paddingTop: 0,
                paddingLeft: 56,
                paddingRight: 14,
                paddingBottom: 10,
                // Legal pad paper: yellow background
                backgroundColor: '#fef9c3',
                // Two layered backgrounds:
                //   1) Red vertical margin line ~50px from left
                //   2) Horizontal blue ruled lines every LINE_H px
                // background-attachment:local makes both scroll with the text content
                // so lines stay perfectly aligned with rows as you type past the max height.
                backgroundImage: [
                  'linear-gradient(to right, transparent 48px, #fca5a5 48px, #fca5a5 50px, transparent 50px)',
                  `repeating-linear-gradient(transparent, transparent ${LINE_H - 1}px, #bfdbfe ${LINE_H - 1}px, #bfdbfe ${LINE_H}px)`,
                ].join(', '),
                backgroundAttachment: 'local',
                color: '#1c1917',
                fontFamily: "'Courier New', Courier, monospace",
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
