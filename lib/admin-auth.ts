import { getChatGPTUser, type ChatGPTUser } from '@/app/chatgpt-auth';

export function isAllowedAdminEmail(email: string) {
  return email.trim().toLowerCase() === (process.env.ADMIN_EMAIL ?? 'admin').trim().toLowerCase();
}
export async function getAdminUser() { const user = await getChatGPTUser(); return user && isAllowedAdminEmail(user.email) ? user : null; }
export async function requireAdminApi(request?: Request): Promise<ChatGPTUser> {
  void request;
  const user = await getAdminUser();
  if (!user) throw new AdminAuthError();
  return user;
}
export class AdminAuthError extends Error { constructor() { super('Admin access required.'); this.name = 'AdminAuthError'; } }
