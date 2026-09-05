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
