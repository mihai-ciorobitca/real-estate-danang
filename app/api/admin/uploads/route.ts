import { createClient } from '@supabase/supabase-js';
import { AdminAuthError, requireAdminApi } from '@/lib/admin-auth';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };

function storage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase Storage is not configured.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
function bucket() { return process.env.SUPABASE_STORAGE_BUCKET || 'property-images'; }

export async function POST(request: Request) {
  try {
    await requireAdminApi(request);
    const file = (await request.formData()).get('file');
    if (!(file instanceof File)) return Response.json({ error: 'Choose an image to upload.' }, { status: 400 });
    if (!allowedTypes.has(file.type)) return Response.json({ error: 'Use a JPG, PNG, WebP or AVIF image.' }, { status: 415 });
    if (file.size <= 0 || file.size > 4 * 1024 * 1024) return Response.json({ error: 'Images must be smaller than 4 MB.' }, { status: 413 });
    const key = `properties/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extensions[file.type]}`;
    const client = storage();
    const { error } = await client.storage.from(bucket()).upload(key, file, { contentType: file.type, cacheControl: '31536000', upsert: false });
    if (error) throw error;
    return Response.json({ key, url: client.storage.from(bucket()).getPublicUrl(key).data.publicUrl }, { status: 201 });
  } catch (error) {
    if (error instanceof AdminAuthError) return Response.json({ error: error.message }, { status: 401 });
    console.error('Unable to upload property image', error);
    return Response.json({ error: 'Could not upload the image.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminApi(request);
    const key = new URL(request.url).searchParams.get('key') ?? '';
    if (!key.startsWith('properties/')) return Response.json({ error: 'Invalid media key.' }, { status: 400 });
    const { error } = await storage().storage.from(bucket()).remove([key]);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminAuthError) return Response.json({ error: error.message }, { status: 401 });
    return Response.json({ error: 'Could not remove the image.' }, { status: 500 });
  }
}
