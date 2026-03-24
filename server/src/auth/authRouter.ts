import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db';
import { signToken, verifyToken } from './jwt';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const u = String(username).trim().toLowerCase();
  const p = String(password);
  if (u.length < 2 || u.length > 30) {
    return res.status(400).json({ error: 'Username must be 2–30 characters' });
  }
  if (p.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }
  try {
    const hash = await bcrypt.hash(p, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, is_admin',
      [u, hash]
    );
    const user = result.rows[0];
    const token = signToken({ userId: user.id, username: user.username, isAdmin: user.is_admin });
    return res.status(201).json({ token, user: { id: user.id, username: user.username, isAdmin: user.is_admin } });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username already taken' });
    }
    console.error('[auth] register:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  try {
    const result = await pool.query(
      'SELECT id, username, password_hash, is_admin FROM users WHERE username = $1',
      [String(username).trim().toLowerCase()]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(String(password), user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const token = signToken({ userId: user.id, username: user.username, isAdmin: user.is_admin });
    return res.json({ token, user: { id: user.id, username: user.username, isAdmin: user.is_admin } });
  } catch (err) {
    console.error('[auth] login:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me  — validates a token
router.get('/me', (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token' });
  }
  try {
    const payload = verifyToken(header.slice(7));
    return res.json({ user: { id: payload.userId, username: payload.username, isAdmin: payload.isAdmin } });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
