import { useEffect, useRef } from 'react';
import socket from '../lib/socket';
import { registerSocketListeners } from '../lib/socketListeners';
import { useGameStore } from '../store/useGameStore';
import * as emitters from '../lib/socketEmitters';
import { useAudioQueue } from './useAudioQueue';

export function useSocket() {
  const cleanupRef = useRef<(() => void) | null>(null);
  const addNotification = useGameStore((s) => s.addNotification);
  const hasConnectedOnce = useRef(false);
  const { enqueue } = useAudioQueue();

  useEffect(() => {
    // Register all game event listeners
    cleanupRef.current = registerSocketListeners(socket, useGameStore, enqueue);

    // Connection status handlers
    const onConnect = () => {
      const { isBoardMode, pendingJoinCode } = useGameStore.getState();

      // Board mode: spectate the room
      if (isBoardMode && pendingJoinCode) {
        emitters.spectateRoom(pendingJoinCode).then((error) => {
          if (error) {
            addNotification(`Failed to connect board: ${error}`, 'error');
          } else {
            useGameStore.getState().setPendingJoinCode(null);
          }
        });
        hasConnectedOnce.current = true;
        return;
      }

      // Board mode reconnection (after refresh, code already consumed)
      if (isBoardMode && !hasConnectedOnce.current) {
        const savedCode = sessionStorage.getItem('boardMode');
        if (savedCode) {
          emitters.spectateRoom(savedCode).then((error) => {
            if (error) {
              addNotification(`Failed to reconnect board: ${error}`, 'error');
            }
          });
        }
        hasConnectedOnce.current = true;
        return;
      }

      if (!hasConnectedOnce.current) {
        hasConnectedOnce.current = true;
        const saved = sessionStorage.getItem('playerSession');
        if (saved) {
          const { roomCode, playerName } = JSON.parse(saved) as { roomCode: string; playerName: string };
          useGameStore.getState().setPlayerName(playerName);
          useGameStore.getState().setIsReconnecting(true);
          socket.emit('lobby:join', roomCode, playerName, (error) => {
            if (error) {
              sessionStorage.removeItem('playerSession');
              useGameStore.getState().setIsReconnecting(false);
              addNotification(`Couldn't rejoin game: ${error}`, 'error');
            }
            // success: game:state listener clears isReconnecting and saves session
          });
        }
        return;
      }

      // Reconnection: re-join the room if we were in a game
      const { gameState, playerName } = useGameStore.getState();

      // Board mode reconnection
      if (isBoardMode && gameState) {
        emitters.spectateRoom(gameState.roomCode).then((error) => {
          if (error) {
            addNotification(`Board reconnection failed: ${error}`, 'error');
          } else {
            addNotification('Board reconnected', 'success');
          }
        });
        return;
      }

      if (gameState && playerName) {
        useGameStore.getState().setIsReconnecting(true);
        socket.emit('lobby:join', gameState.roomCode, playerName, (error) => {
          if (error) {
            useGameStore.getState().setIsReconnecting(false);
            addNotification(`Reconnection failed: ${error}`, 'error');
          }
          // success: game:state listener clears isReconnecting
        });
      }
    };

    const onDisconnect = (reason: string) => {
      const { gameState } = useGameStore.getState();
      if (gameState && gameState.phase !== 'lobby') {
        useGameStore.getState().setIsReconnecting(true);
      }
      addNotification(`Disconnected: ${reason}`, 'warning');
    };

    const onConnectError = (err: Error) => {
      addNotification(`Connection error: ${err.message}`, 'error');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    // Connect the socket, passing auth token if available
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) socket.auth = { token: storedToken };
    socket.connect();

    return () => {
      cleanupRef.current?.();
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.disconnect();
    };
  }, [addNotification]);
}
