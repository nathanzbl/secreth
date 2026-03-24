import { GameRoom } from './GameRoom';
import { generateRoomCode } from '../../../shared/src';

export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();
  // playerId → roomCode for reconnection
  private playerRooms: Map<string, string> = new Map();
  // spectator socketId → roomCode
  private spectatorRooms: Map<string, string> = new Map();

  createRoom(hostId: string, hostName: string): GameRoom {
    let roomCode: string;
    do {
      roomCode = generateRoomCode();
    } while (this.rooms.has(roomCode));

    const room = new GameRoom(roomCode, hostId, hostName);
    this.rooms.set(roomCode, room);
    this.playerRooms.set(hostId, roomCode);
    return room;
  }

  joinRoom(roomCode: string, playerId: string, playerName: string): GameRoom {
    const room = this.rooms.get(roomCode);
    if (!room) throw new Error('Room not found');
    room.addPlayer(playerId, playerName);
    this.playerRooms.set(playerId, roomCode);
    return room;
  }

  /**
   * Reconnect a player to a room with a new socket ID.
   * Returns the room if successful, null if no match found.
   */
  reconnectPlayer(roomCode: string, playerName: string, newSocketId: string): GameRoom | null {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return null;

    const oldId = room.findDisconnectedPlayer(playerName);
    if (!oldId) return null;

    // Clean up old mapping
    this.playerRooms.delete(oldId);

    // Swap IDs in the game
    room.replacePlayerId(oldId, newSocketId);
    this.playerRooms.set(newSocketId, room.roomCode);

    return room;
  }

  getRoom(roomCode: string): GameRoom | undefined {
    return this.rooms.get(roomCode);
  }

  getRoomForPlayer(playerId: string): GameRoom | undefined {
    const code = this.playerRooms.get(playerId);
    if (!code) return undefined;
    return this.rooms.get(code);
  }

  spectateRoom(roomCode: string, socketId: string): GameRoom {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) throw new Error('Room not found');
    room.addSpectator(socketId);
    this.spectatorRooms.set(socketId, roomCode.toUpperCase());
    return room;
  }

  removeSpectator(socketId: string): GameRoom | undefined {
    const code = this.spectatorRooms.get(socketId);
    if (!code) return undefined;
    const room = this.rooms.get(code);
    if (room) {
      room.removeSpectator(socketId);
    }
    this.spectatorRooms.delete(socketId);
    return room;
  }

  dismissRoom(roomCode: string): void {
    this.rooms.delete(roomCode);
    for (const [playerId, code] of this.playerRooms) {
      if (code === roomCode) this.playerRooms.delete(playerId);
    }
    for (const [socketId, code] of this.spectatorRooms) {
      if (code === roomCode) this.spectatorRooms.delete(socketId);
    }
  }

  leaveRoom(playerId: string): GameRoom | undefined {
    const room = this.getRoomForPlayer(playerId);
    if (room) {
      room.removePlayer(playerId);
      // If room is in lobby and has no connected players, clean up
      if (room.getState().phase === 'lobby' && room.getPlayerIds().length === 0) {
        this.rooms.delete(room.roomCode);
      }
      // Only delete mapping in lobby; keep it for in-game reconnection
      if (room.getState().phase === 'lobby') {
        this.playerRooms.delete(playerId);
      }
    } else {
      this.playerRooms.delete(playerId);
    }
    return room;
  }
}
