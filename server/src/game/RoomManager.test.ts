import { describe, it, expect, beforeEach } from 'vitest';
import { RoomManager } from './RoomManager';

describe('RoomManager', () => {
  let manager: RoomManager;

  beforeEach(() => {
    manager = new RoomManager();
  });

  describe('createRoom', () => {
    it('returns a GameRoom with a valid 4-character room code', () => {
      const room = manager.createRoom('host1', 'Host');
      expect(room.roomCode).toHaveLength(4);
      expect(room.roomCode).toMatch(/^[A-Z2-9]+$/);
    });

    it('sets the host as a player in the room', () => {
      const room = manager.createRoom('host1', 'Host');
      expect(room.getPlayerIds()).toContain('host1');
    });

    it('creates room in lobby phase', () => {
      const room = manager.createRoom('host1', 'Host');
      expect(room.getState().phase).toBe('lobby');
    });

    it('assigns the host as hostId', () => {
      const room = manager.createRoom('host1', 'Host');
      expect(room.getHostId()).toBe('host1');
    });
  });

  describe('joinRoom', () => {
    it('adds a player to an existing room', () => {
      const room = manager.createRoom('host1', 'Host');
      manager.joinRoom(room.roomCode, 'p2', 'Player 2');
      expect(room.getPlayerIds()).toContain('p2');
      expect(room.getPlayerIds()).toHaveLength(2);
    });

    it('throws when joining a nonexistent room', () => {
      expect(() => manager.joinRoom('ZZZZ', 'p1', 'Player')).toThrow('Room not found');
    });

    it('returns the room after joining', () => {
      const room = manager.createRoom('host1', 'Host');
      const joined = manager.joinRoom(room.roomCode, 'p2', 'Player 2');
      expect(joined.roomCode).toBe(room.roomCode);
    });
  });

  describe('getRoom', () => {
    it('returns the room by code', () => {
      const room = manager.createRoom('host1', 'Host');
      const fetched = manager.getRoom(room.roomCode);
      expect(fetched).toBeDefined();
      expect(fetched!.roomCode).toBe(room.roomCode);
    });

    it('returns undefined for unknown code', () => {
      expect(manager.getRoom('NOPE')).toBeUndefined();
    });
  });

  describe('getRoomForPlayer', () => {
    it('returns the room a player belongs to', () => {
      const room = manager.createRoom('host1', 'Host');
      manager.joinRoom(room.roomCode, 'p2', 'Player 2');

      const found = manager.getRoomForPlayer('p2');
      expect(found).toBeDefined();
      expect(found!.roomCode).toBe(room.roomCode);
    });

    it('returns the room for the host', () => {
      const room = manager.createRoom('host1', 'Host');
      const found = manager.getRoomForPlayer('host1');
      expect(found).toBeDefined();
      expect(found!.roomCode).toBe(room.roomCode);
    });

    it('returns undefined for unknown player', () => {
      expect(manager.getRoomForPlayer('nobody')).toBeUndefined();
    });
  });

  describe('leaveRoom', () => {
    it('removes a player from the room in lobby', () => {
      const room = manager.createRoom('host1', 'Host');
      manager.joinRoom(room.roomCode, 'p2', 'Player 2');

      manager.leaveRoom('p2');
      expect(room.getPlayerIds()).not.toContain('p2');
    });

    it('cleans up empty lobby rooms', () => {
      const room = manager.createRoom('host1', 'Host');
      const code = room.roomCode;

      manager.leaveRoom('host1');
      expect(manager.getRoom(code)).toBeUndefined();
    });

    it('clears player-to-room mapping after leaving', () => {
      manager.createRoom('host1', 'Host');
      manager.leaveRoom('host1');
      expect(manager.getRoomForPlayer('host1')).toBeUndefined();
    });

    it('returns the room the player left', () => {
      const room = manager.createRoom('host1', 'Host');
      manager.joinRoom(room.roomCode, 'p2', 'Player 2');

      const leftRoom = manager.leaveRoom('p2');
      expect(leftRoom).toBeDefined();
      expect(leftRoom!.roomCode).toBe(room.roomCode);
    });

    it('returns undefined when an unknown player tries to leave', () => {
      const result = manager.leaveRoom('nobody');
      expect(result).toBeUndefined();
    });
  });

  describe('multiple rooms', () => {
    it('creates independent rooms', () => {
      const room1 = manager.createRoom('host1', 'Host 1');
      const room2 = manager.createRoom('host2', 'Host 2');

      expect(room1.roomCode).not.toBe(room2.roomCode);
      expect(room1.getPlayerIds()).toContain('host1');
      expect(room1.getPlayerIds()).not.toContain('host2');
      expect(room2.getPlayerIds()).toContain('host2');
      expect(room2.getPlayerIds()).not.toContain('host1');
    });

    it('maps players to their respective rooms', () => {
      const room1 = manager.createRoom('host1', 'Host 1');
      const room2 = manager.createRoom('host2', 'Host 2');

      manager.joinRoom(room1.roomCode, 'p1', 'Player 1');
      manager.joinRoom(room2.roomCode, 'p2', 'Player 2');

      expect(manager.getRoomForPlayer('p1')!.roomCode).toBe(room1.roomCode);
      expect(manager.getRoomForPlayer('p2')!.roomCode).toBe(room2.roomCode);
    });

    it('leaving one room does not affect another', () => {
      const room1 = manager.createRoom('host1', 'Host 1');
      const room2 = manager.createRoom('host2', 'Host 2');

      manager.leaveRoom('host1');

      expect(manager.getRoom(room1.roomCode)).toBeUndefined();
      expect(manager.getRoom(room2.roomCode)).toBeDefined();
      expect(room2.getPlayerIds()).toContain('host2');
    });
  });
});
