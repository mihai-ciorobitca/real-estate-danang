import { env } from 'cloudflare:workers';
import { getChatGPTUser, type ChatGPTUser } from '@/app/chatgpt-auth';

type RuntimeEnv = { ADMIN_EMAILS?: string };

export function isAllowedAdminEmail(email: string): boolean {
  if (import.meta.env.DEV && email.toLowerCase().endsWith('@sites.test')) return true;
  const configured = ((env as unknown as RuntimeEnv).ADMIN_EMAILS ?? process.env.ADMIN_EMAILS ?? '')
    .split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
  return configured.includes(email.trim().toLowerCase());
}

export async function getAdminUser(): Promise<ChatGPTUser | null> {
  const user = await getChatGPTUser();
  return user && isAllowedAdminEmail(user.email) ? user : null;
}

export async function requireAdminApi(request?: Request): Promise<ChatGPTUser> {
  const requestUserId = request?.headers.get('oai-authenticated-user-id');
  const requestEmail = request?.headers.get('oai-authenticated-user-email');
  const requestUser = requestUserId && requestEmail
    ? { userId: requestUserId, email: requestEmail, displayName: requestEmail, fullName: null }
    : null;
  const user = requestUser && isAllowedAdminEmail(requestUser.email) ? requestUser : await getAdminUser();
  if (!user && import.meta.env.DEV) {
    return { userId: 'sites-local-admin', email: 'seedy@sites.test', displayName: 'Local admin', fullName: null };
  }
  if (!user) throw new AdminAuthError();
  return user;
}

export class AdminAuthError extends Error {
  constructor() {
    super('Admin access required.');
    this.name = 'AdminAuthError';
  }
}
