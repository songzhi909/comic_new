import db from '../db/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

interface User {
  id: number;
  username: string;
  password_hash: string;
  role: string;
}

export function ensureAdminExists(): void {
  const admin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!admin) {
    const hash = bcrypt.hashSync(config.adminPassword, 10);
    db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
    console.log('Admin user created with default password');
  }
}

export function login(username: string, password: string): { token: string; user: Omit<User, 'password_hash'> } | null {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return null;
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(user.id, token, expiresAt);

  const { password_hash, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
}

export function register(username: string, password: string, inviteCode: string): { token: string; user: Omit<User, 'password_hash'> } | null {
  const code = db.prepare('SELECT * FROM invite_codes WHERE code = ?').get(inviteCode) as any;
  if (!code) return null;
  if (code.used_count >= code.max_uses) return null;
  if (code.expires_at && new Date(code.expires_at) < new Date()) return null;

  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existingUser) return null;

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(username, hash, code.role);

  db.prepare('UPDATE invite_codes SET used_count = used_count + 1 WHERE id = ?').run(code.id);

  const token = jwt.sign({ userId: result.lastInsertRowid, role: code.role }, config.jwtSecret, { expiresIn: '7d' });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(result.lastInsertRowid, token, expiresAt);

  return {
    token,
    user: { id: result.lastInsertRowid as number, username, password_hash: '', role: code.role },
  };
}

export function getUserFromToken(token: string): User | null {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { userId: number };
    return db.prepare('SELECT * FROM users WHERE id = ?').get(payload.userId) as User | undefined ?? null;
  } catch {
    return null;
  }
}

export function changePassword(userId: number, oldPassword: string, newPassword: string): boolean {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
  if (!user || !bcrypt.compareSync(oldPassword, user.password_hash)) return false;

  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, userId);
  return true;
}
