import { listProperties } from '@/db/properties';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const properties = await listProperties({ publishedOnly: true });
    return Response.json({ properties }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Unable to load public properties', error);
    return Response.json({ error: 'Properties are temporarily unavailable.' }, { status: 503 });
  }
}
