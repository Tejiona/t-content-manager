import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const TOKEN_NAME = 'tcm_token';
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface AuthPayload {
  adminId: string;
  email: string;
  role: string;
  lang: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_MAX_AGE });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function setSessionCookie(token: string) {
  return {
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: TOKEN_MAX_AGE,
    path: '/',
  };
}

export function clearSessionCookie() {
  return {
    name: TOKEN_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
    path: '/',
  };
}

// Ensure at least one admin exists (run on first startup)
export async function ensureAdmin() {
  const count = await prisma.admin.count();
  if (count === 0) {
    const hash = await hashPassword(process.env.ADMIN_PASSWORD || 'admin123');
    await prisma.admin.create({
      data: {
        email: process.env.ADMIN_EMAIL || 'solutions@tejiona.com',
        password: hash,
        name: 'Admin TEJIONA',
        role: 'super_admin',
        lang: 'fr',
      },
    });
    console.log('[Auth] Default admin created');
  }
}
