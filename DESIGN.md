# Coastal Studio

Shared palette: deep teal #102d32, ivory #f6f5ef, paper #fffefa, brass #b99965. Manrope for all controls and Vietnamese text, Georgia for editorial headings. 16px media corners, 10px inputs, thin warm-gray borders. Lucide icons 18px, stroke 1.75. Primary buttons teal or brass, consistent visible focus.

Reference concepts: generated admin, hero and collection/service concepts dated 2026-09-09. Existing information architecture and real inventory data take precedence over illustrative names, counts and copy in mockups. Existing about/contact/footer extend the same palette and typography. Use the requested England flag for English, rather than the UK flag shown in one concept.

Implement full bilingual administration (including login, feedback, forms, status and actions), default Vietnamese when no saved preference. Preserve PostgreSQL, Supabase and session authentication. No public admin bypass. Motion: staggered entrance, hover lift, drawer entrance; reduced-motion disables nonessential motion.

New production assets: GPT-generated arch/sun/wave logo and daylight edit of existing coastal hero. Existing service, collection and footer photographs remain part of the coordinated visual system. Do not use generated concepts as UI or invent property imagery for actual listings.

## Verification and fidelity review

Compared generated hero, inventory and admin references against browser renders at 1536x1024; also checked 390x844 mobile.

- Palette and imagery: coordinated ivory/teal/brass with the generated daylight hero and arch logo. Retained actual existing property photos instead of mockup listings.
- Typography: Manrope controls and Lora editorial headings, both with Vietnamese subsets. Replaced Georgia after detecting poorly positioned Vietnamese accents.
- Layout: airy editorial hero, floating search, three-column desktop inventory, single-column mobile inventory. Existing gallery, map and private-collection workflows retained rather than replacing them with mockup-only content.
- Admin: sidebar, real inventory metrics, search/status controls, sortable listing rows and an animated editor. Header wraps and action widths repaired at 390px; actions remain available on mobile.
- Translation: Vietnamese/English navigation, forms, login/access-denied screens, notices, validation and API failure messages. English flag intentionally uses St George's cross per request. Sample/data names and numeric counts replace the concept's illustrative records.
- Interaction: verified Vietnamese search, locale persistence, new-listing validation, Escape dismissal, property galleries, favorites and details in browser. Preview is clearly labeled, development-only and does not save, upload or delete.
- Production boundary: /admin-preview returns 404, /admin redirects unauthenticated requests, admin inventory API returns 401. Production database writes and Supabase uploads not exercised because no production credentials were loaded.
- Checks: Next production build and TypeScript passed. ESLint has no errors; existing img-element advisory warnings remain.
