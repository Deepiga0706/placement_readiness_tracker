import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const USERS_FILE = path.join(process.cwd(), 'src', 'data', 'users.json');

function ensureUsersFile() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]), 'utf8');
  }
}

function readUsers(): any[] {
  ensureUsersFile();
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function writeUsers(users: any[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

export async function createUser(email: string, password: string, name?: string) {
  const users = readUsers();
  const exists = users.find(u => u.email === email.toLowerCase());
  if (exists) throw new Error('User already exists');
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: `u_${Date.now()}`, email: email.toLowerCase(), name: name || '', password: hashed, createdAt: new Date().toISOString() };
  users.push(user);
  writeUsers(users);
  return { id: user.id, email: user.email, name: user.name };
}

export async function verifyUser(email: string, password: string) {
  const users = readUsers();
  const user = users.find(u => u.email === email.toLowerCase());
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;
  return { id: user.id, email: user.email };
}

export function getUserById(id: string) {
  const users = readUsers();
  return users.find(u => u.id === id) || null;
}

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'dev-jwt-secret';

export function createJwt(payload: any, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}
