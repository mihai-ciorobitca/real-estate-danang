import { createProperty, listProperties } from '@/db/properties';
import { AdminAuthError, requireAdminApi } from '@/lib/admin-auth';
import { validatePropertyInput, ValidationError } from '@/lib/property-validation';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAdminApi(request);
    return Response.json({ properties: await listProperties() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof AdminAuthError) return Response.json({ error: error.message }, { status: 401 });
    return Response.json({ error: 'Could not load inventory.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminApi(request);
    const property = await createProperty(validatePropertyInput(await request.json()));
    return Response.json({ property }, { status: 201 });
  } catch (error) {
    if (error instanceof AdminAuthError) return Response.json({ error: error.message }, { status: 401 });
    if (error instanceof ValidationError) return Response.json({ error: error.message }, { status: 400 });
    if (error instanceof Error && /UNIQUE constraint failed/i.test(error.message)) return Response.json({ error: 'This URL slug is already in use.' }, { status: 409 });
    console.error('Unable to create property', error);
    return Response.json({ error: 'Could not create the property.' }, { status: 500 });
  }
}
