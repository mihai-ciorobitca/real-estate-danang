import { createAdminSession, SESSION_COOKIE } from '@/app/chatgpt-auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');
  const rawReturnTo = String(form.get('returnTo') ?? '/admin');
  const returnTo = rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//') ? rawReturnTo : '/admin';
  if (!process.env.ADMIN_PASSWORD || email !== (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase() || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL(`/admin/login?error=1&returnTo=${encodeURIComponent(returnTo)}`, request.url), 303);
  }
  const response = NextResponse.redirect(new URL(returnTo, request.url), 303);
  response.cookies.set(SESSION_COOKIE, await createAdminSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
