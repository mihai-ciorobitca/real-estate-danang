import { database } from './properties';
import type { PhotoJob } from '@/lib/photo-job-types';

export type JobRow = { id: string; owner: string; source: string; result: string | null; state: PhotoJob['state']; error: string | null; prediction: string | null; created_at: Date; lease_until: Date | null };
let ready: Promise<unknown> | null = null;
export async function photoDatabase() {
  const sql = database();
  ready ??= sql`CREATE TABLE IF NOT EXISTS admin_photo_jobs (
    id UUID PRIMARY KEY, owner TEXT NOT NULL, source TEXT NOT NULL,
    result TEXT, state TEXT NOT NULL DEFAULT 'submitting', error TEXT, prediction TEXT,
    lease_until TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`.catch(error => { ready = null; throw error; });
  await ready;
  return sql;
}
export function publicJob(row: JobRow): PhotoJob {
  return { id: row.id, source: row.source, result: row.result, state: row.state, error: row.error, createdAt: new Date(row.created_at).toISOString() };
}
