import { deleteProperty, updateProperty } from '@/db/properties';
import { AdminAuthError, requireAdminApi } from '@/lib/admin-auth';
import { validatePropertyInput, ValidationError } from '@/lib/property-validation';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    await requireAdminApi(request);
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id < 1) return Response.json({ error: 'Invalid property id.' }, { status: 400 });
    const property = await updateProperty(id, validatePropertyInput(await request.json()));
    if (!property) return Response.json({ error: 'Property not found.' }, { status: 404 });
    return Response.json({ property });
  } catch (error) {
    if (error instanceof AdminAuthError) return Response.json({ error: error.message }, { status: 401 });
    if (error instanceof ValidationError) return Response.json({ error: error.message }, { status: 400 });
    if (error instanceof Error && /UNIQUE constraint failed/i.test(error.message)) return Response.json({ error: 'This URL slug is already in use.' }, { status: 409 });
    console.error('Unable to update property', error);
    return Response.json({ error: 'Could not update the property.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    await requireAdminApi(request);
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id < 1) return Response.json({ error: 'Invalid property id.' }, { status: 400 });
    const deleted = await deleteProperty(id);
    return deleted ? Response.json({ ok: true }) : Response.json({ error: 'Property not found.' }, { status: 404 });
  } catch (error) {
    if (error instanceof AdminAuthError) return Response.json({ error: error.message }, { status: 401 });
    return Response.json({ error: 'Could not delete the property.' }, { status: 500 });
  }
}
