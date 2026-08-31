import Image from 'next/image';
import { requireChatGPTUser, chatGPTSignOutPath } from '@/app/chatgpt-auth';
import { listProperties } from '@/db/properties';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import AdminDashboard from './admin-dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await requireChatGPTUser('/admin');
  if (!isAllowedAdminEmail(user.email)) {
    return (
      <main className="admin-access-denied">
        <Image src="/brand-logo-v2.png" alt="Da Nang Real Estate" width={88} height={88} priority />
        <p>PRIVATE ADMINISTRATION</p>
        <h1>This account does not have admin access.</h1>
        <span>Signed in as {user.email}</span>
        <a href={chatGPTSignOutPath('/admin')} target="_top">Use another account</a>
      </main>
    );
  }

  const properties = await listProperties();
  return <AdminDashboard initialProperties={properties} currentUser={user.displayName} signOutPath={chatGPTSignOutPath('/')} />;
}
