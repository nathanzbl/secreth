import { useState, useEffect, Fragment } from 'react';
import { useGameStore } from '../store/useGameStore';
import * as adminApi from '../lib/adminApi';
import type { AdminUser, AdminGame } from '../lib/adminApi';

type Tab = 'users' | 'games';

export default function AdminScreen() {
  const authToken = useGameStore((s) => s.authToken);
  const setScreen = useGameStore((s) => s.setScreen);
  const [tab, setTab] = useState<Tab>('users');

  if (!authToken) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-950 text-parchment-100 flex flex-col">
      {/* Header */}
      <div className="border-b border-stone-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setScreen('home')}
            className="text-xs font-sans text-stone-500 hover:text-stone-300 transition-colors uppercase tracking-wider"
          >
            ← Home
          </button>
          <h1 className="font-display font-bold text-amber-500 tracking-[0.2em] uppercase text-sm">
            Admin Panel
          </h1>
        </div>
        <div className="flex gap-1">
          {(['users', 'games'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-sans uppercase tracking-wider rounded transition-colors ${
                tab === t
                  ? 'bg-stone-800 text-amber-500'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {tab === 'users' ? (
          <UsersTab token={authToken} />
        ) : (
          <GamesTab token={authToken} />
        )}
      </div>
    </div>
  );
}

// ─── Users Tab ───────────────────────────────────────────────────────────────

function UsersTab({ token }: { token: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setUsers(await adminApi.listUsers(token));
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteUser(token, id);
      setUsers((u) => u.filter((x) => x.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-sans uppercase tracking-wider text-stone-400">
          Users ({users.length})
        </h2>
        <button
          type="button"
          onClick={() => { setShowCreate(true); setEditId(null); }}
          className="px-3 py-1.5 text-xs font-sans uppercase tracking-wider bg-amber-800 hover:bg-amber-700 text-parchment-100 rounded transition-colors"
        >
          + Create User
        </button>
      </div>

      {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

      {showCreate && (
        <CreateUserForm
          token={token}
          onCreated={(u) => { setUsers((prev) => [...prev, u]); setShowCreate(false); }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {loading ? (
        <p className="text-stone-600 text-xs">Loading...</p>
      ) : (
        <div className="border border-stone-800 rounded-lg overflow-hidden">
          <table className="w-full text-xs font-sans">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-900/50">
                <th className="text-left px-4 py-3 text-stone-500 font-normal uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 text-stone-500 font-normal uppercase tracking-wider">Username</th>
                <th className="text-left px-4 py-3 text-stone-500 font-normal uppercase tracking-wider">Admin</th>
                <th className="text-left px-4 py-3 text-stone-500 font-normal uppercase tracking-wider">Created</th>
                <th className="text-left px-4 py-3 text-stone-500 font-normal uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <Fragment key={u.id}>
                  <tr className="border-b border-stone-900 hover:bg-stone-900/30 transition-colors">
                    <td className="px-4 py-3 text-stone-600">{u.id}</td>
                    <td className="px-4 py-3 text-parchment-100 font-medium">{u.username}</td>
                    <td className="px-4 py-3">
                      {u.is_admin ? (
                        <span className="text-amber-500">Admin</span>
                      ) : (
                        <span className="text-stone-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditId(editId === u.id ? null : u.id)}
                          className="text-stone-400 hover:text-amber-500 transition-colors uppercase tracking-wider"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id, u.username)}
                          className="text-stone-600 hover:text-red-500 transition-colors uppercase tracking-wider"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editId === u.id && (
                    <tr className="border-b border-stone-800 bg-stone-900/20">
                      <td colSpan={5} className="px-4 py-3">
                        <EditUserForm
                          token={token}
                          user={u}
                          onUpdated={(updated) => {
                            setUsers((prev) => prev.map((x) => x.id === updated.id ? updated : x));
                            setEditId(null);
                          }}
                          onCancel={() => setEditId(null)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-stone-600">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CreateUserForm({
  token,
  onCreated,
  onCancel,
}: {
  token: string;
  onCreated: (u: AdminUser) => void;
  onCancel: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) { setError('Username and password required'); return; }
    setError('');
    setLoading(true);
    try {
      const user = await adminApi.createUser(token, username, password, isAdmin);
      onCreated(user);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="mb-4 p-4 border border-stone-700 rounded-lg bg-stone-900/30">
      <p className="text-xs font-sans uppercase tracking-wider text-stone-400 mb-3">New User</p>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-wider text-stone-600">Username</label>
          <input
            className="bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-xs text-parchment-100 focus:outline-none focus:border-amber-700"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            maxLength={30}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-wider text-stone-600">Password</label>
          <input
            type="password"
            className="bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-xs text-parchment-100 focus:outline-none focus:border-amber-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            className="accent-amber-600"
          />
          <span className="text-xs text-stone-400">Admin</span>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-sans uppercase tracking-wider bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-parchment-100 rounded transition-colors"
          >
            {loading ? '...' : 'Create'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-sans uppercase tracking-wider text-stone-500 hover:text-stone-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 text-[10px] mt-2">{error}</p>}
    </div>
  );
}

function EditUserForm({
  token,
  user,
  onUpdated,
  onCancel,
}: {
  token: string;
  user: AdminUser;
  onUpdated: (u: AdminUser) => void;
  onCancel: () => void;
}) {
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(user.is_admin);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    const updates: { username?: string; password?: string; is_admin?: boolean } = {};
    if (username !== user.username) updates.username = username;
    if (password) updates.password = password;
    if (isAdmin !== user.is_admin) updates.is_admin = isAdmin;
    if (Object.keys(updates).length === 0) { onCancel(); return; }
    try {
      const updated = await adminApi.updateUser(token, user.id, updates);
      onUpdated(updated);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-wider text-stone-600">Username</label>
        <input
          className="bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-xs text-parchment-100 focus:outline-none focus:border-amber-700"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={30}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-wider text-stone-600">New Password</label>
        <input
          type="password"
          className="bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-xs text-parchment-100 focus:outline-none focus:border-amber-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="leave blank to keep"
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isAdmin}
          onChange={(e) => setIsAdmin(e.target.checked)}
          className="accent-amber-600"
        />
        <span className="text-xs text-stone-400">Admin</span>
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-sans uppercase tracking-wider bg-stone-700 hover:bg-stone-600 disabled:opacity-50 text-parchment-100 rounded transition-colors"
        >
          {loading ? '...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-sans uppercase tracking-wider text-stone-500 hover:text-stone-300 transition-colors"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-red-500 text-[10px] mt-1">{error}</p>}
    </div>
  );
}

// ─── Games Tab ───────────────────────────────────────────────────────────────

function GamesTab({ token }: { token: string }) {
  const [games, setGames] = useState<AdminGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedGame, setExpandedGame] = useState<AdminGame | null>(null);
  const [expandLoading, setExpandLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminApi.listGames(token)
      .then(setGames)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleExpand = async (id: number) => {
    if (expandedId === id) { setExpandedId(null); setExpandedGame(null); return; }
    setExpandedId(id);
    setExpandLoading(true);
    try {
      const game = await adminApi.getGame(token, id);
      setExpandedGame(game);
    } catch (e: any) {
      alert(e.message);
    }
    setExpandLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Delete game #${id}? This cannot be undone.`)) return;
    try {
      await adminApi.deleteGame(token, id);
      setGames((g) => g.filter((x) => x.id !== id));
      if (expandedId === id) { setExpandedId(null); setExpandedGame(null); }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const winnerColor = (w: string | null) => {
    if (w === 'liberals') return 'text-blue-400';
    if (w === 'fascists') return 'text-red-400';
    return 'text-stone-600';
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-sans uppercase tracking-wider text-stone-400">
          Games ({games.length})
        </h2>
      </div>

      {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

      {loading ? (
        <p className="text-stone-600 text-xs">Loading...</p>
      ) : (
        <div className="border border-stone-800 rounded-lg overflow-hidden">
          <table className="w-full text-xs font-sans">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-900/50">
                <th className="text-left px-4 py-3 text-stone-500 font-normal uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 text-stone-500 font-normal uppercase tracking-wider">Room</th>
                <th className="text-left px-4 py-3 text-stone-500 font-normal uppercase tracking-wider">Host</th>
                <th className="text-left px-4 py-3 text-stone-500 font-normal uppercase tracking-wider">Players</th>
                <th className="text-left px-4 py-3 text-stone-500 font-normal uppercase tracking-wider">Winner</th>
                <th className="text-left px-4 py-3 text-stone-500 font-normal uppercase tracking-wider">Condition</th>
                <th className="text-left px-4 py-3 text-stone-500 font-normal uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-stone-500 font-normal uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <Fragment key={g.id}>
                  <tr className="border-b border-stone-900 hover:bg-stone-900/30 transition-colors">
                    <td className="px-4 py-3 text-stone-600">{g.id}</td>
                    <td className="px-4 py-3 font-mono text-amber-600 tracking-widest">{g.room_code}</td>
                    <td className="px-4 py-3 text-stone-400">{g.host_username ?? '—'}</td>
                    <td className="px-4 py-3 text-stone-400">{g.player_count ?? '—'}</td>
                    <td className={`px-4 py-3 font-medium capitalize ${winnerColor(g.winner)}`}>
                      {g.winner ?? <span className="text-stone-600 font-normal">—</span>}
                    </td>
                    <td className="px-4 py-3 text-stone-500">{g.win_condition ?? '—'}</td>
                    <td className="px-4 py-3 text-stone-500">
                      {new Date(g.started_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleExpand(g.id)}
                          className="text-stone-400 hover:text-amber-500 transition-colors uppercase tracking-wider"
                        >
                          {expandedId === g.id ? 'Close' : 'View'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(g.id)}
                          className="text-stone-600 hover:text-red-500 transition-colors uppercase tracking-wider"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === g.id && (
                    <tr className="border-b border-stone-800 bg-stone-900/10">
                      <td colSpan={8} className="px-6 py-4">
                        {expandLoading ? (
                          <p className="text-stone-600 text-xs">Loading...</p>
                        ) : expandedGame ? (
                          <GameDetail game={expandedGame} />
                        ) : null}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {games.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-stone-600">No games recorded yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function GameDetail({ game }: { game: AdminGame }) {
  const roleColor = (role: string) => {
    if (role === 'liberal') return 'text-blue-400';
    if (role === 'fascist') return 'text-red-400';
    if (role === 'hitler') return 'text-red-600 font-bold';
    return 'text-stone-400';
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
        <div>
          <p className="text-[10px] text-stone-600 uppercase tracking-wider">Started</p>
          <p className="text-stone-300">{new Date(game.started_at).toLocaleString()}</p>
        </div>
        {game.ended_at && (
          <div>
            <p className="text-[10px] text-stone-600 uppercase tracking-wider">Ended</p>
            <p className="text-stone-300">{new Date(game.ended_at).toLocaleString()}</p>
          </div>
        )}
      </div>
      {game.players && game.players.length > 0 ? (
        <table className="w-full text-xs font-sans">
          <thead>
            <tr className="border-b border-stone-800">
              <th className="text-left py-2 text-stone-600 font-normal uppercase tracking-wider">Player</th>
              <th className="text-left py-2 text-stone-600 font-normal uppercase tracking-wider">Role</th>
              <th className="text-left py-2 text-stone-600 font-normal uppercase tracking-wider">Survived</th>
            </tr>
          </thead>
          <tbody>
            {game.players.map((p, i) => (
              <tr key={i} className="border-b border-stone-900">
                <td className="py-2 text-stone-300">{p.player_name}</td>
                <td className={`py-2 capitalize ${roleColor(p.role)}`}>{p.role}</td>
                <td className="py-2">
                  {p.survived ? (
                    <span className="text-green-600">Survived</span>
                  ) : (
                    <span className="text-stone-600">Eliminated</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-stone-600 text-xs">No player data recorded</p>
      )}
    </div>
  );
}
