import LoginForm from './login-form';
export const dynamic = 'force-dynamic';
export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string; returnTo?: string }> }) {
  const params = await searchParams;
  const returnTo = params.returnTo?.startsWith('/') && !params.returnTo.startsWith('//') ? params.returnTo : '/admin';
  return <LoginForm returnTo={returnTo} error={!!params.error}/>;
}
