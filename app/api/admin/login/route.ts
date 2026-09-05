import { createAdminSession, SESSION_COOKIE } from '@/app/chatgpt-auth';

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');
  const rawReturnTo = String(form.get('returnTo') ?? '/admin');
  const returnTo = rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//') ? rawReturnTo : '/admin';
  if (!process.env.ADMIN_PASSWORD || email !== (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase() || password !== process.env.ADMIN_PASSWORD) {
    return Response.redirect(new URL(`/admin/login?error=1&returnTo=${encodeURIComponent(returnTo)}`, request.url), 303);
  }
  const response = Response.redirect(new URL(returnTo, request.url), 303);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.headers.append('Set-Cookie', `${SESSION_COOKIE}=${await createAdminSession()}; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=604800`);
  return response;
}
