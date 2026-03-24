import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../store/useGameStore';
import { getMe } from '../lib/authApi';
import HomeScreen from './HomeScreen';
import LobbyScreen from './LobbyScreen';
import GameScreen from './GameScreen';
import GameOverScreen from './GameOverScreen';
import CentralBoardScreen from './CentralBoardScreen';
import BoardLobbyScreen from './BoardLobbyScreen';
import AdminScreen from './AdminScreen';

export default function App() {
  useSocket();

  const screen = useGameStore((s) => s.screen);
  const gameOverData = useGameStore((s) => s.gameOverData);
  const isBoardMode = useGameStore((s) => s.isBoardMode);
  const setScreen = useGameStore((s) => s.setScreen);

  // Restore auth session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    getMe(token).then((user) => {
      if (user) {
        useGameStore.getState().setAuthUser(user);
        useGameStore.getState().setAuthToken(token);
        // If we were trying to navigate to /admin, allow it now that auth is confirmed
        if (useGameStore.getState().screen === 'admin' && !user.isAdmin) {
          useGameStore.getState().setScreen('home');
        }
      } else {
        localStorage.removeItem('authToken');
        // Kick non-authenticated users away from admin screen
        if (useGameStore.getState().screen === 'admin') {
          useGameStore.getState().setScreen('home');
        }
      }
    });
  }, []);

  // Parse URL on mount for /join/:code, /board/:code, and /admin
  useEffect(() => {
    const path = window.location.pathname;

    if (path === '/admin') {
      setScreen('admin');
      window.history.replaceState({}, '', '/');
      return;
    }

    const joinMatch = path.match(/^\/join\/([A-Z0-9]{4})$/i);
    if (joinMatch) {
      useGameStore.getState().setPendingJoinCode(joinMatch[1].toUpperCase());
      window.history.replaceState({}, '', '/');
      return;
    }

    const boardMatch = path.match(/^\/board\/([A-Z0-9]{4})$/i);
    if (boardMatch) {
      useGameStore.getState().setIsBoardMode(true);
      useGameStore.getState().setPendingJoinCode(boardMatch[1].toUpperCase());
      sessionStorage.setItem('boardMode', boardMatch[1].toUpperCase());
      window.history.replaceState({}, '', '/');
      return;
    }

    // Restore board mode from sessionStorage on refresh (only if not on home screen)
    // The sessionStorage entry is set when navigating to /board/:code and cleared when
    // the spectator connection fails or the user manually navigates away.
    const savedBoardCode = sessionStorage.getItem('boardMode');
    if (savedBoardCode) {
      // Only restore if the socket was previously connected to a game
      // (i.e., this is a page refresh, not a fresh visit)
      useGameStore.getState().setIsBoardMode(true);
      useGameStore.getState().setPendingJoinCode(savedBoardCode);
    }
  }, []);

  // If the game is over, show the GameOverScreen regardless of screen state
  const showGameOver = gameOverData !== null;

  // Board mode screens
  if (isBoardMode) {
    return (
      <AnimatePresence mode="wait">
        {showGameOver ? (
          <motion.div key="board-game-over" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <GameOverScreen />
          </motion.div>
        ) : screen === 'game' ? (
          <motion.div key="board-game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <CentralBoardScreen />
          </motion.div>
        ) : screen === 'lobby' ? (
          <motion.div key="board-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <BoardLobbyScreen />
          </motion.div>
        ) : (
          <motion.div key="board-connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <BoardLobbyScreen />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {showGameOver ? (
        <motion.div
          key="game-over"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GameOverScreen />
        </motion.div>
      ) : screen === 'admin' ? (
        <motion.div
          key="admin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AdminScreen />
        </motion.div>
      ) : screen === 'home' ? (
        <motion.div
          key="home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <HomeScreen />
        </motion.div>
      ) : screen === 'lobby' ? (
        <motion.div
          key="lobby"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LobbyScreen />
        </motion.div>
      ) : (
        <motion.div
          key="game"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GameScreen />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
