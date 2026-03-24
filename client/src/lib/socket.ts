import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '../../../shared/src/types/events';

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// In production the client is served from the same origin as the server
const SERVER_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

export const socket: TypedSocket = io(SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

export default socket;
