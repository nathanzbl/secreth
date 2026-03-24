import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import * as emitters from '../lib/socketEmitters';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { AuthModal } from '../components/ui/AuthModal';

export default function HomeScreen() {
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const addNotification = useGameStore((s) => s.addNotification);
  const pendingJoinCode = useGameStore((s) => s.pendingJoinCode);
  const authUser = useGameStore((s) => s.authUser);
  const logout = useGameStore((s) => s.logout);
  const setScreen = useGameStore((s) => s.setScreen);
  const joinNameRef = useRef<HTMLInputElement>(null);

  const [createName, setCreateName] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showQrJoinMessage, setShowQrJoinMessage] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [joinError, setJoinError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingCreateName, setPendingCreateName] = useState('');

  // Pre-fill join code from QR scan / URL
  useEffect(() => {
    if (pendingJoinCode) {
      setJoinCode(pendingJoinCode);
      setShowQrJoinMessage(true);
      useGameStore.getState().setPendingJoinCode(null);
      setTimeout(() => joinNameRef.current?.focus(), 400);
    }
  }, [pendingJoinCode]);

  const validateCreateName = (name: string): string | null => {
    if (!name) return 'Enter your name';
    if (name.length > 12) return 'Name must be 12 characters or less';
    return null;
  };

  const doCreateRoom = async (name: string) => {
    setCreateLoading(true);
    try {
      const roomCode = await emitters.createRoom(name);
      if (roomCode === 'ERROR') {
        setCreateError('Failed to create room');
        addNotification('Failed to create room', 'error');
      } else {
        setPlayerName(name);
      }
    } catch {
      setCreateError('Connection error');
    }
    setCreateLoading(false);
  };

  const handleCreate = async () => {
    const name = createName.trim();
    const err = validateCreateName(name);
    if (err) { setCreateError(err); return; }
    setCreateError('');

    if (!authUser) {
      // Save intent, show auth modal
      setPendingCreateName(name);
      setShowAuthModal(true);
      return;
    }

    await doCreateRoom(name);
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    if (pendingCreateName) {
      await doCreateRoom(pendingCreateName);
      setPendingCreateName('');
    }
  };

  const handleJoin = async () => {
    const name = joinName.trim();
    const code = joinCode.trim().toUpperCase();
    if (!name) { setJoinError('Enter your name'); return; }
    if (name.length > 12) { setJoinError('Name must be 12 characters or less'); return; }
    if (!code) { setJoinError('Enter a room code'); return; }
    setJoinError('');
    setJoinLoading(true);
    try {
      const error = await emitters.joinRoom(code, name);
      if (error) {
        setJoinError(error);
        addNotification(error, 'error');
      } else {
        setPlayerName(name);
      }
    } catch {
      setJoinError('Connection error');
    }
    setJoinLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-propaganda p-6">
      {/* Auth status bar */}
      <AnimatePresence>
        {authUser && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 right-4 flex items-center gap-3"
          >
            <span className="text-xs font-sans text-stone-500">
              Signed in as{' '}
              <span className="text-amber-500 font-semibold">{authUser.username}</span>
            </span>
            {authUser.isAdmin && (
              <button
                type="button"
                onClick={() => setScreen('admin')}
                className="text-[10px] font-sans uppercase tracking-wider text-amber-700 hover:text-amber-500 transition-colors"
              >
                Admin
              </button>
            )}
            <button
              type="button"
              onClick={logout}
              className="text-[10px] font-sans uppercase tracking-wider text-stone-600 hover:text-stone-400 transition-colors"
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <div className="mb-3">
          <div className="deco-rule w-48 mx-auto mb-4" />
          <h1 className="font-display font-black tracking-[0.15em] uppercase leading-none">
            <span className="block text-4xl sm:text-6xl text-red-700">Secret</span>
            <span className="block text-5xl sm:text-7xl text-parchment-100 -mt-1">Hitler</span>
          </h1>
          <div className="deco-rule w-48 mx-auto mt-4" />
        </div>
        <p className="text-stone-600 text-xs font-sans tracking-[0.3em] uppercase">
          A social deduction game for 5{'\u2013'}10 players
        </p>
      </motion.div>

      {/* Forms */}
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl">
        {/* Create Game */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1"
        >
          <Card glow className="h-full">
            <h2 className="font-display text-base font-bold text-amber-500 mb-4 text-center uppercase tracking-[0.2em]">
              Create Game
            </h2>
            <div className="flex flex-col gap-4">
              <Input
                label="Your Name"
                placeholder="Enter your name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                maxLength={12}
                error={createError}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                loading={createLoading}
                disabled={createLoading}
                onClick={handleCreate}
              >
                {authUser ? 'Create Room' : 'Sign In to Create'}
              </Button>
              {!authUser && (
                <p className="text-[10px] font-sans text-stone-600 text-center -mt-1">
                  An account is required to host a game
                </p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center justify-center">
          <span className="text-stone-700 font-display text-xs tracking-[0.3em] uppercase">or</span>
        </div>

        {/* Join Game */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1"
        >
          <Card className={`h-full ${showQrJoinMessage ? 'ring-1 ring-amber-700/50' : ''}`}>
            <h2 className="font-display text-base font-bold text-stone-400 mb-4 text-center uppercase tracking-[0.2em]">
              Join Game
            </h2>
            {showQrJoinMessage && (
              <p className="text-xs font-sans text-amber-500 text-center mb-3">
                Enter your name to join room <span className="font-bold">{joinCode}</span>
              </p>
            )}
            <div className="flex flex-col gap-4">
              <Input
                ref={joinNameRef}
                label="Your Name"
                placeholder="Enter your name"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                maxLength={12}
              />
              <Input
                label="Room Code"
                placeholder="e.g. ABCD"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                error={joinError}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
              <Button
                variant="ghost"
                size="lg"
                className="w-full"
                loading={joinLoading}
                disabled={joinLoading}
                onClick={handleJoin}
              >
                Join Room
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-stone-700 text-[10px] font-sans mt-10 text-center tracking-wider"
      >
        Based on the original board game by Goat, Wolf, &amp; Cabbage.
      </motion.p>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            onSuccess={handleAuthSuccess}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
