import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db';
import { verifyToken } from '../auth/jwt';

const router = Router();

// Middleware: require a valid admin JWT
function requireAdmin(req: Request, res: Response, next: NextFunction): any {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const payload = verifyToken(header.slice(7));
    if (!payload.isAdmin) return res.status(403).json({ error: 'Forbidden' });
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.use(requireAdmin);

// ─── Users ───────────────────────────────────────────────────────────────────

router.get('/users', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, is_admin, created_at FROM users ORDER BY id'
    );
    return res.json({ users: result.rows });
  } catch (err) {
    console.error('[admin] GET /users:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/users', async (req, res) => {
  const { username, password, is_admin } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  try {
    const hash = await bcrypt.hash(String(password), 10);
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, is_admin)
       VALUES ($1, $2, $3)
       RETURNING id, username, is_admin, created_at`,
      [String(username).trim().toLowerCase(), hash, !!is_admin]
    );
    return res.status(201).json({ user: result.rows[0] });
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ error: 'Username already taken' });
    console.error('[admin] POST /users:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/users/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const { username, password, is_admin } = req.body ?? {};
  try {
    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (username !== undefined) {
      updates.push(`username = $${idx++}`);
      params.push(String(username).trim().toLowerCase());
    }
    if (password !== undefined) {
      const hash = await bcrypt.hash(String(password), 10);
      updates.push(`password_hash = $${idx++}`);
      params.push(hash);
    }
    if (is_admin !== undefined) {
      updates.push(`is_admin = $${idx++}`);
      params.push(!!is_admin);
    }
    if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update' });
    params.push(id);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}
       RETURNING id, username, is_admin, created_at`,
      params
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: result.rows[0] });
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ error: 'Username already taken' });
    console.error('[admin] PATCH /users/:id:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/users/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[admin] DELETE /users/:id:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ─── Games ──────────────────────────────────────────────────────────────────

router.get('/games', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT g.id, g.room_code, g.player_count, g.winner, g.win_condition,
             g.started_at, g.ended_at, u.username AS host_username
      FROM games g
      LEFT JOIN users u ON u.id = g.host_user_id
      ORDER BY g.id DESC
    `);
    return res.json({ games: result.rows });
  } catch (err) {
    console.error('[admin] GET /games:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/games/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const gameResult = await pool.query(`
      SELECT g.id, g.room_code, g.player_count, g.winner, g.win_condition,
             g.started_at, g.ended_at, u.username AS host_username
      FROM games g
      LEFT JOIN users u ON u.id = g.host_user_id
      WHERE g.id = $1
    `, [id]);
    if (gameResult.rows.length === 0) return res.status(404).json({ error: 'Game not found' });
    const playersResult = await pool.query(
      'SELECT player_name, role, survived FROM game_players WHERE game_id = $1 ORDER BY id',
      [id]
    );
    return res.json({ game: { ...gameResult.rows[0], players: playersResult.rows } });
  } catch (err) {
    console.error('[admin] GET /games/:id:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/games/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const result = await pool.query('DELETE FROM games WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Game not found' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[admin] DELETE /games/:id:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
