import { env } from 'cloudflare:workers';

type RuntimeEnv = { MEDIA?: R2Bucket };
type RouteContext = { params: Promise<{ key: string[] }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const bucket = (env as unknown as RuntimeEnv).MEDIA;
  if (!bucket) return new Response('Media unavailable', { status: 503 });
  const key = (await params).key.join('/');
  const object = await bucket.get(key);
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', headers.get('cache-control') ?? 'public, max-age=31536000, immutable');
  return new Response(object.body, { headers });
}
