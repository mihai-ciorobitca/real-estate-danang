import { del, put } from '@vercel/blob';
import { AdminAuthError, requireAdminApi } from '@/lib/admin-auth';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };

export async function POST(request: Request) {
  try {
    await requireAdminApi(request);
    const file = (await request.formData()).get('file');
    if (!(file instanceof File)) return Response.json({ error: 'Choose an image to upload.' }, { status: 400 });
    if (!allowedTypes.has(file.type)) return Response.json({ error: 'Use a JPG, PNG, WebP or AVIF image.' }, { status: 415 });
    if (file.size <= 0 || file.size > 4 * 1024 * 1024) return Response.json({ error: 'Images must be smaller than 4 MB.' }, { status: 413 });
    const pathname = `properties/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extensions[file.type]}`;
    const blob = await put(pathname, file, { access: 'public', addRandomSuffix: false, contentType: file.type });
    return Response.json({ key: blob.pathname, url: blob.url }, { status: 201 });
  } catch (error) {
    if (error instanceof AdminAuthError) return Response.json({ error: error.message }, { status: 401 });
    console.error('Unable to upload property image', error);
    return Response.json({ error: 'Could not upload the image.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminApi(request);
    const url = new URL(request.url).searchParams.get('url') ?? '';
    if (!url.startsWith('https://')) return Response.json({ error: 'Invalid media URL.' }, { status: 400 });
    await del(url);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminAuthError) return Response.json({ error: error.message }, { status: 401 });
    return Response.json({ error: 'Could not remove the image.' }, { status: 500 });
  }
}
