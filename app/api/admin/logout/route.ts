import { SESSION_COOKIE } from '@/app/chatgpt-auth';
export async function GET(request: Request) {
  const response = Response.redirect(new URL('/', request.url), 303);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.headers.append('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=0`);
  return response;
}
