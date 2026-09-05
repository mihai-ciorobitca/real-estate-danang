import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string; returnTo?: string }> }) {
  const params = await searchParams;
  const returnTo = params.returnTo?.startsWith('/') && !params.returnTo.startsWith('//') ? params.returnTo : '/admin';
  return (
    <main className="admin-access-denied">
      <Image src="/brand-logo-v2.png" alt="Da Nang Real Estate" width={88} height={88} priority />
      <p>PRIVATE ADMINISTRATION</p><h1>Sign in to manage properties.</h1>
      <form action="/api/admin/login" method="post" style={{ display: 'grid', gap: 12, width: 'min(360px, 90vw)' }}>
        <input type="hidden" name="returnTo" value={returnTo} />
        <input name="email" type="email" required autoComplete="username" placeholder="Admin email" style={{ padding: 14 }} />
        <input name="password" type="password" required autoComplete="current-password" placeholder="Password" style={{ padding: 14 }} />
        {params.error && <span role="alert">Incorrect email or password.</span>}
        <button type="submit" style={{ padding: 14, cursor: 'pointer' }}>Sign in</button>
      </form>
    </main>
  );
}
