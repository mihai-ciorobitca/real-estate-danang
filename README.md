# Da Nang Real Estate

A Vercel-ready Next.js 16 application with a bilingual property website and a password-protected inventory dashboard.

## Stack

- Next.js App Router, React, TypeScript and Tailwind CSS
- Supabase Postgres
- Supabase Storage for property images
- Signed, HTTP-only admin sessions

## Local development

1. Use Node.js 22.13 or newer.
2. Copy `.env.example` to `.env.local` and fill in all values.
3. Run `npm install` and `npm run dev`.
4. Open `http://localhost:3000`; the dashboard is at `/admin`.

The database tables and the six starter properties are created automatically on first access. SQL migrations can also be generated with `npm run db:generate` and applied with `npm run db:migrate`.

## Deploy to Vercel

1. Push this folder to a GitHub repository and import it at https://vercel.com/new.
2. Create a Supabase project. Under **Project Settings → Database**, copy the transaction-pooler connection string (port `6543`) and add it to Vercel as `DATABASE_URL`. Replace the password placeholder with your database password and keep `sslmode=require`.
3. In Supabase Storage, create a public bucket named `property-images`. Add `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET=property-images` to Vercel. Never expose the service-role key in browser code.
4. Add these environment variables for Production, Preview, and Development:
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `AUTH_SECRET` (at least 32 random characters)
   - `NEXT_PUBLIC_SITE_URL` (your production URL)
5. Deploy. Vercel detects Next.js and runs `npm run build` automatically.

No Cloudflare D1, R2, Wrangler, Vite, Vinext, or OpenAI Sites runtime is required.


## Admin Photo Studio

Only authenticated admins can submit or inspect photo jobs. Set the server-only
WAVESPEED_API_KEY in the deployment environment. Never expose it through a
NEXT_PUBLIC variable. Existing DATABASE_URL and Supabase Storage variables are
also required. The application creates admin_photo_jobs on first use (the same
DDL permissions already used by the property database initializer are required).

New uploads automatically enter a sequential enhancement queue. Admins can drag
photo grips on desktop or touch devices, use arrow buttons/keyboard arrows, and
choose the first image as the cover. The existing images array persists the exact
order when the listing is saved. Enhancements do not publish until Save property.
Original/4K toggles retain both files. Existing photos can also be enhanced manually.

WaveSpeed endpoint: openai/gpt-image-2.5-sunburst/edit, quality medium, resolution
4k, WebP output. One reference image per job. The provider's 4K tier may return
roughly 8 MP at dimensions such as 3520 x 2352; output is normalized to a 4096 px
long edge with the same aspect ratio and compressed below the existing 4 MiB
bucket limit. Lighting, colour, clarity and compression are improved while actual
room layout, furnishings and physical defects must remain unchanged. AI output
must be reviewed against the original before publishing.

Phone images up to 30 MB are locally compressed when needed before upload.
JPG, PNG, WebP and AVIF are supported. HEIC must first be exported as JPG.
Jobs are durable in Postgres; draft form/order and queued IDs are restored from
sessionStorage in the same tab after reload. Keep the editor open to submit queued
images. Submitted WaveSpeed jobs keep running when checking is paused or the tab
is closed; reopen the listing to fetch and permanently save their results. The
indicator shows elapsed time and completed counts, never a fabricated countdown.

Stable request UUIDs deduplicate submission retries across server instances.
Uncertain submissions are not resubmitted automatically. Polling/storage failures
reuse the same prediction. Admission is limited to 3 active jobs and 150 daily jobs
per administrator. Store results using deterministic object keys; do not widen the
bucket limit or expose the WaveSpeed key to work around errors.

Validation: node --test tests/photo-studio.test.mjs; npx tsc --noEmit; npm run build.
