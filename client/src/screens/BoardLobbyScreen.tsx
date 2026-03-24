import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { unlockAudio } from '../hooks/useAudioQueue';

export default function BoardLobbyScreen() {
  const gameState = useGameStore((s) => s.gameState);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const handleUnlockAudio = () => {
    unlockAudio();
    setAudioUnlocked(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-propaganda p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-8 max-w-lg w-full"
      >
        {/* Title */}
        <div className="text-center">
          <div className="deco-rule w-48 mx-auto mb-4" />
          <h1 className="font-display font-black tracking-[0.15em] uppercase leading-none">
            <span className="block text-4xl sm:text-5xl text-red-700">Secret</span>
            <span className="block text-5xl sm:text-6xl text-parchment-100 -mt-1">Hitler</span>
          </h1>
          <div className="deco-rule w-48 mx-auto mt-4" />
        </div>

        {/* Audio unlock button */}
        {!audioUnlocked && (
          <button
            type="button"
            onClick={handleUnlockAudio}
            className="bg-stone-900/80 border border-amber-800/40 rounded-lg px-5 py-2.5 text-sm font-sans text-amber-500 hover:text-amber-400 hover:border-amber-700 transition-colors"
          >
            🔊 Tap to enable voice narration
          </button>
        )}

        <div className="bg-stone-900/80 border border-stone-800/50 rounded-lg px-6 py-4 text-center">
          <p className="text-[10px] font-sans uppercase tracking-[0.3em] text-stone-500 mb-2">
            Central Board
          </p>
          {gameState ? (
            <>
              <p className="text-3xl font-display font-black tracking-[0.3em] text-amber-500">
                {gameState.roomCode}
              </p>
              <div className="deco-rule w-32 mx-auto my-4" />
              <div className="flex flex-col gap-1.5">
                {gameState.players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 px-4 py-1.5 rounded bg-stone-800/40"
                  >
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        player.isConnected ? 'bg-green-600' : 'bg-stone-600'
                      }`}
                    />
                    <span className="text-sm font-display font-bold text-parchment-100">
                      {player.name}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs font-sans text-stone-500 mt-4 italic">
                Waiting for host to start the game...
              </p>
            </>
          ) : (
            <p className="text-sm font-sans text-stone-400 mt-2">Connecting...</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
