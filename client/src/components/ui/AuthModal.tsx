import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { login, register } from '../../lib/authApi';
import socket from '../../lib/socket';
import { Input } from './Input';
import { Button } from './Button';

interface AuthModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

type Tab = 'login' | 'register';

export function AuthModal({ onSuccess, onClose }: AuthModalProps) {
  const setAuthUser = useGameStore((s) => s.setAuthUser);
  const setAuthToken = useGameStore((s) => s.setAuthToken);

  const [tab, setTab] = useState<Tab>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const u = username.trim();
    const p = password;
    if (!u || !p) { setError('All fields required'); return; }
    setError('');
    setLoading(true);
    try {
      const fn = tab === 'login' ? login : register;
      const { token, user } = await fn(u, p);

      localStorage.setItem('authToken', token);
      setAuthUser(user);
      setAuthToken(token);

      // Reconnect socket so server middleware can attach userId
      socket.auth = { token };
      socket.disconnect();
      socket.connect();

      onSuccess();
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    }
    setLoading(false);
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setError('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-sm bg-stone-950 border border-stone-800 rounded-lg overflow-hidden"
      >
        {/* Tabs */}
        <div className="flex border-b border-stone-800">
          {(['login', 'register'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => switchTab(t)}
              className={`flex-1 py-3 text-xs font-sans uppercase tracking-[0.2em] transition-colors ${
                tab === t
                  ? 'text-amber-500 border-b-2 border-amber-600 -mb-px'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="text-center mb-1">
            <p className="text-xs font-sans text-stone-500">
              {tab === 'login'
                ? 'Sign in to create and host rooms'
                : 'Create an account to host rooms'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tab === 'login' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="flex flex-col gap-4"
            >
              <Input
                label="Username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={30}
                autoComplete="username"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                error={error}
              />
            </motion.div>
          </AnimatePresence>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
            disabled={loading}
            onClick={handleSubmit}
          >
            {tab === 'login' ? 'Sign In' : 'Create Account'}
          </Button>

          <p className="text-center text-xs font-sans text-stone-600">
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
              className="text-amber-600 hover:text-amber-400 transition-colors"
            >
              {tab === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
