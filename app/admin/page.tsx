import AccessDenied from './access-denied';
import { requireChatGPTUser, chatGPTSignOutPath } from '@/app/chatgpt-auth';
import { listProperties } from '@/db/properties';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import AdminDashboard from './admin-dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await requireChatGPTUser('/admin');
  if (!isAllowedAdminEmail(user.email)) {
    return <AccessDenied email={user.email} signOutPath={chatGPTSignOutPath('/admin')}/>;
  }

  const properties = await listProperties();
  return <AdminDashboard initialProperties={properties} currentUser={user.displayName} signOutPath={chatGPTSignOutPath('/')} />;
}
