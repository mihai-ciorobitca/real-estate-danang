import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type ChatGPTUser = { userId: string; displayName: string; email: string; fullName: string | null };
export const SESSION_COOKIE = 'dnre_admin_session';

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value && process.env.NODE_ENV === 'production') throw new Error('AUTH_SECRET is not configured.');
  return value ?? 'local-development-secret-change-me';
}

async function signature(value: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
  return Buffer.from(bytes).toString('base64url');
}

export async function createAdminSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  return `${payload}.${await signature(payload)}`;
}

async function validSession(token?: string) {
  if (!token) return false;
  const [payload, supplied, extra] = token.split('.');
  if (!payload || !supplied || extra || supplied !== await signature(payload)) return false;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now(); } catch { return false; }
}

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  if (!(await validSession((await cookies()).get(SESSION_COOKIE)?.value))) return null;
  const email = process.env.ADMIN_EMAIL ?? 'admin';
  return { userId: 'vercel-admin', email, displayName: email, fullName: null };
}

export async function requireChatGPTUser(returnTo: string) {
  const user = await getChatGPTUser();
  if (user) return user;
  redirect(`/admin/login?returnTo=${encodeURIComponent(returnTo)}`);
}

export function chatGPTSignOutPath(returnTo?: string) { void returnTo; return '/api/admin/logout'; }
