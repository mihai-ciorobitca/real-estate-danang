import { env } from 'cloudflare:workers';
import { AdminAuthError, requireAdminApi } from '@/lib/admin-auth';

type RuntimeEnv = { MEDIA?: R2Bucket };
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };

function mediaBinding(): R2Bucket {
  const bucket = (env as unknown as RuntimeEnv).MEDIA;
  if (!bucket) throw new Error('Cloudflare R2 binding `MEDIA` is unavailable.');
  return bucket;
}

export async function POST(request: Request) {
  try {
    const user = await requireAdminApi(request);
    const data = await request.formData();
    const file = data.get('file');
    if (!(file instanceof File)) return Response.json({ error: 'Choose an image to upload.' }, { status: 400 });
    if (!allowedTypes.has(file.type)) return Response.json({ error: 'Use a JPG, PNG, WebP or AVIF image.' }, { status: 415 });
    if (file.size <= 0 || file.size > 8 * 1024 * 1024) return Response.json({ error: 'Images must be smaller than 8 MB.' }, { status: 413 });

    const key = `properties/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extensions[file.type]}`;
    await mediaBinding().put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' },
      customMetadata: { uploadedBy: user.userId },
    });
    return Response.json({ key, url: `/media/${key}` }, { status: 201 });
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
    await mediaBinding().delete(key);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminAuthError) return Response.json({ error: error.message }, { status: 401 });
    return Response.json({ error: 'Could not remove the image.' }, { status: 500 });
  }
}
