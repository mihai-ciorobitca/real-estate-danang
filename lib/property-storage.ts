import { createClient } from '@supabase/supabase-js';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';

export function propertyStorage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('storage_configuration');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
export const propertyBucket = () => process.env.SUPABASE_STORAGE_BUCKET || 'property-images';

// Only images in our own bucket may be sent to the paid image service.
export function ownedImageKey(value: string) {
  const root = new URL(`/storage/v1/object/public/${propertyBucket()}/`, process.env.NEXT_PUBLIC_SUPABASE_URL);
  const url = new URL(value);
  if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname) || url.search || url.hash) throw new Error('invalid_image');
  const key = decodeURIComponent(url.pathname.slice(root.pathname.length));
  if (!/^properties\/[a-zA-Z0-9/_.-]+$/.test(key) || key.includes('..')) throw new Error('invalid_image');
  return key;
}

export async function validatedSource(value: string): Promise<string> {
  if (/^\/(?:luxury\/)?[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp|avif)$/.test(value)) {
    const file = await stat(join(process.cwd(), 'public', value.slice(1))).catch(() => null);
    if (!file?.isFile() || file.size > 25 * 1024 * 1024 || !process.env.NEXT_PUBLIC_SITE_URL) throw new Error('invalid_image');
    const url = new URL(value, process.env.NEXT_PUBLIC_SITE_URL);
    if (url.protocol !== 'https:') throw new Error('invalid_image');
    return url.href;
  }
  const key = ownedImageKey(value);
  const { data, error } = await propertyStorage().storage.from(propertyBucket()).info(key);
  if (error || !data?.contentType?.startsWith('image/') || !data.size || data.size > 25 * 1024 * 1024) throw new Error('invalid_image');
  return value;
}
