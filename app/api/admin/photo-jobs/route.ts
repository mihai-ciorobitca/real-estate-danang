import { requireAdminApi, AdminAuthError } from '@/lib/admin-auth';
import { photoDatabase, publicJob, type JobRow } from '@/db/photo-jobs';
import { validatedSource, propertyBucket, propertyStorage } from '@/lib/property-storage';
import { REAL_ESTATE_PROMPT, downloadResult, waveRequest } from '@/lib/wavespeed';
import { encodePhotoResult } from '@/lib/photo-output';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
function failure(error: unknown) {
  if (error instanceof AdminAuthError) return json({ error: 'auth' }, 401);
  const code = error instanceof Error ? error.message : '';
  const known = ['ai_configuration', 'storage_configuration', 'invalid_image', 'busy', 'daily_limit', 'ai_credit', 'ai_busy'];
  return json({ error: known.includes(code) ? code : 'service_unavailable' }, code === 'invalid_image' ? 400 : 503);
}

export async function POST(request: Request) {
  try {
    const user = await requireAdminApi(request);
    if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'auth' }, 403);
    if (!process.env.WAVESPEED_API_KEY) throw new Error('ai_configuration');
    const { id, source } = await request.json();
    if (typeof id !== 'string' || !uuid.test(id) || typeof source !== 'string') return json({ error: 'invalid_image' }, 400);
    const sql = await photoDatabase();
    const existing = await sql<JobRow[]>`SELECT * FROM admin_photo_jobs WHERE id=${id} AND owner=${user.email}`;
    if (existing[0]) return json({ job: publicJob(existing[0]) });
    const providerSource = await validatedSource(source);
    // Serialize admission across tabs and server instances; idempotent client IDs prevent duplicate charges.
    const inserted = await sql.begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock(hashtext(${`photo-jobs:${user.email}`}))`;
      const duplicate = await tx<JobRow[]>`SELECT * FROM admin_photo_jobs WHERE id=${id} AND owner=${user.email}`;
      if (duplicate[0]) return false;
      const counts = await tx`SELECT count(*) FILTER (WHERE state IN ('submitting','processing') AND created_at > now()-interval '30 minutes') AS active,
        count(*) FILTER (WHERE created_at > now()-interval '1 day') AS daily FROM admin_photo_jobs WHERE owner=${user.email}`;
      if (Number(counts[0].active) >= 3) throw new Error('busy');
      if (Number(counts[0].daily) >= 150) throw new Error('daily_limit');
      await tx`INSERT INTO admin_photo_jobs (id,owner,source) VALUES (${id},${user.email},${source})`;
      return true;
    });
    if (inserted) {
      try {
        const prediction = await waveRequest('openai/gpt-image-2.5-sunburst/edit', { images: [providerSource], prompt: REAL_ESTATE_PROMPT, resolution: '4k', quality: 'medium', output_format: 'webp' });
        await sql`UPDATE admin_photo_jobs SET prediction=${prediction.id},state='processing' WHERE id=${id}`;
      } catch (error) {
        const code = error instanceof Error ? error.message : 'ai_unavailable';
        const definite = ['ai_credit','ai_configuration','ai_busy','ai_rejected'].includes(code);
        // A transport error may occur after the provider accepted the paid job: never auto-resubmit.
        await sql`UPDATE admin_photo_jobs SET state=${definite ? 'failed' : 'uncertain'},error=${definite ? code : 'submission_uncertain'} WHERE id=${id}`;
      }
    }
    const rows = await sql<JobRow[]>`SELECT * FROM admin_photo_jobs WHERE id=${id} AND owner=${user.email}`;
    return json({ job: publicJob(rows[0]) }, 201);
  } catch (error) { return failure(error); }
}

export async function GET(request: Request) {
  try {
    const user = await requireAdminApi(request);
    const sql = await photoDatabase();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) {
      const rows = await sql<JobRow[]>`SELECT * FROM admin_photo_jobs WHERE owner=${user.email} ORDER BY created_at DESC LIMIT 150`;
      return json({ jobs: rows.map(publicJob), configured: Boolean(process.env.WAVESPEED_API_KEY) });
    }
    if (!uuid.test(id)) return json({ error: 'invalid_image' }, 400);
    const rows = await sql<JobRow[]>`SELECT * FROM admin_photo_jobs WHERE id=${id} AND owner=${user.email}`;
    let job = rows[0];
    if (!job) return json({ error: 'not_found' }, 404);
    if (job.state === 'submitting' && Date.now() - new Date(job.created_at).getTime() > 90_000) {
      await sql`UPDATE admin_photo_jobs SET state='uncertain',error='submission_uncertain' WHERE id=${id} AND state='submitting'`;
    }
    if (job.state === 'processing' && job.prediction) {
      const leased = await sql<JobRow[]>`UPDATE admin_photo_jobs SET lease_until=now()+interval '60 seconds' WHERE id=${id} AND (lease_until IS NULL OR lease_until < now()) AND state='processing' RETURNING *`;
      if (leased.length) {
        try {
          const prediction = await waveRequest(`predictions/${job.prediction}/result`);
          if (['failed','cancelled','timeout','deleted'].includes(prediction.status)) {
            await sql`UPDATE admin_photo_jobs SET state='failed',error='generation_failed' WHERE id=${id}`;
          } else if (prediction.status === 'completed' && prediction.outputs?.[0]) {
            const bytes = await encodePhotoResult(await downloadResult(prediction.outputs[0]));
            const client = propertyStorage();
            const resultKey = `properties/refined/${id}.webp`;
            const { error } = await client.storage.from(propertyBucket()).upload(resultKey, bytes, { contentType: 'image/webp', cacheControl: '31536000', upsert: true });
            if (error) throw new Error('storage_save');
            const result = client.storage.from(propertyBucket()).getPublicUrl(resultKey).data.publicUrl;
            await sql`UPDATE admin_photo_jobs SET state='completed',result=${result},error=NULL WHERE id=${id}`;
          }
        } catch (error) {
          // Poll/save failures are resumable without another paid generation.
          const code = error instanceof Error ? error.message : '';
          await sql`UPDATE admin_photo_jobs SET error=${['storage_save','result_host','result_format','result_resolution','result_size','ai_configuration'].includes(code) ? code : 'poll_retry'} WHERE id=${id}`;
        } finally { await sql`UPDATE admin_photo_jobs SET lease_until=now()+interval '4 seconds' WHERE id=${id}`; }
      }
    }
    const latest = await sql<JobRow[]>`SELECT * FROM admin_photo_jobs WHERE id=${id} AND owner=${user.email}`;
    job = latest[0];
    return json({ job: publicJob(job) });
  } catch (error) { return failure(error); }
}
