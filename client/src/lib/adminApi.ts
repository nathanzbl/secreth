const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:3001';

function headers(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function req<T>(token: string, path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers(token), ...(options.headers as Record<string, string> ?? {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

export interface AdminUser {
  id: number;
  username: string;
  is_admin: boolean;
  created_at: string;
}

export interface AdminGame {
  id: number;
  room_code: string;
  player_count: number | null;
  winner: string | null;
  win_condition: string | null;
  started_at: string;
  ended_at: string | null;
  host_username: string | null;
  players?: { player_name: string; role: string; survived: boolean }[];
}

// ─── Users ───────────────────────────────────────────────────────────────────

export const listUsers = (token: string) =>
  req<{ users: AdminUser[] }>(token, '/api/admin/users').then((d) => d.users);

export const createUser = (
  token: string,
  username: string,
  password: string,
  is_admin: boolean
) =>
  req<{ user: AdminUser }>(token, '/api/admin/users', {
    method: 'POST',
    body: JSON.stringify({ username, password, is_admin }),
  }).then((d) => d.user);

export const updateUser = (
  token: string,
  id: number,
  updates: { username?: string; password?: string; is_admin?: boolean }
) =>
  req<{ user: AdminUser }>(token, `/api/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }).then((d) => d.user);

export const deleteUser = (token: string, id: number) =>
  req<{ ok: boolean }>(token, `/api/admin/users/${id}`, { method: 'DELETE' });

// ─── Games ───────────────────────────────────────────────────────────────────

export const listGames = (token: string) =>
  req<{ games: AdminGame[] }>(token, '/api/admin/games').then((d) => d.games);

export const getGame = (token: string, id: number) =>
  req<{ game: AdminGame }>(token, `/api/admin/games/${id}`).then((d) => d.game);

export const deleteGame = (token: string, id: number) =>
  req<{ ok: boolean }>(token, `/api/admin/games/${id}`, { method: 'DELETE' });
