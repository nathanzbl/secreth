import { pool } from '../db';
import type { GameResult } from '../../../shared/src/types/game';

export interface PlayerRecord {
  name: string;
  role: string;
  survived: boolean;
}

export async function countRecentGames(userId: number, windowMs: number): Promise<number> {
  try {
    const since = new Date(Date.now() - windowMs).toISOString();
    const result = await pool.query(
      `SELECT COUNT(*) FROM games WHERE host_user_id = $1 AND started_at > $2`,
      [userId, since]
    );
    return parseInt(result.rows[0].count, 10);
  } catch (err) {
    console.error('[GameService] countRecentGames error:', err);
    return 0; // fail open so a DB error doesn't permanently block the user
  }
}

export async function recordGameStart(
  roomCode: string,
  hostUserId: number | undefined,
  playerCount: number
): Promise<number | null> {
  try {
    const result = await pool.query(
      `INSERT INTO games (room_code, host_user_id, player_count)
       VALUES ($1, $2, $3) RETURNING id`,
      [roomCode, hostUserId ?? null, playerCount]
    );
    return result.rows[0].id as number;
  } catch (err) {
    console.error('[GameService] recordGameStart error:', err);
    return null;
  }
}

export async function recordGameEnd(
  gameId: number,
  result: GameResult,
  players: PlayerRecord[]
): Promise<void> {
  try {
    await pool.query(
      `UPDATE games SET winner = $1, win_condition = $2, ended_at = NOW() WHERE id = $3`,
      [result.winner, result.condition, gameId]
    );
    for (const player of players) {
      await pool.query(
        `INSERT INTO game_players (game_id, player_name, role, survived) VALUES ($1, $2, $3, $4)`,
        [gameId, player.name, player.role, player.survived]
      );
    }
  } catch (err) {
    console.error('[GameService] recordGameEnd error:', err);
  }
}
