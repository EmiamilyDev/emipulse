# EMIPulse

EMIPulse is a Next.js App Router project with Tailwind CSS, shadcn-style UI components, and Supabase.

It includes:

- Secure admin login with Supabase Auth.
- Admin route protection for `/admin`.
- Admin dashboard cards with Supabase + live external APIs (Instagram, YouTube, Google Trends).
- Event CRUD (search, filters, pagination, create/edit/delete, publish/draft, image upload).
- Gallery manager (drag-and-drop uploads, captions, event assignment, deletion, responsive grid).
- Hero banner editor with live preview and single-active-banner flow.
- Public fan dashboard home with responsive sections.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create env file from template:

```bash
cp .env.example .env.local
```

3. Set your Supabase values in `.env.local`.

4. Run schema and policies in Supabase SQL Editor:

- `supabase/schema.sql`
- `supabase/seed.sql` (optional demo data)

5. Start dev server:

```bash
npm run dev
```

Run tests:

```bash
npm run test
```

6. Open:

- Public home: `http://localhost:3000`
- Admin login: `http://localhost:3000/login`

## Supabase Notes

- Add your admin user's `auth.users.id` into `public.admin_users.user_id`.
- Create storage buckets: `events`, `gallery`, and `hero` (schema file includes insert statements).
- Public homepage reads only published/public data via RLS.

## External APIs

The app integrates with real APIs and keeps safe fallback values when credentials are missing or requests fail:

- Instagram Graph API (`INSTAGRAM_IG_USER_ID`, `INSTAGRAM_ACCESS_TOKEN`)
- YouTube Data API v3 (`YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID`)
- Google Trends via SerpApi (`SERPAPI_API_KEY`, `GOOGLE_TRENDS_KEYWORD`)

Implementation is in `src/lib/services/external-apis.ts`.

## Test Coverage

Core flow test cases included:

- Event form validation (`src/lib/validation/event.test.ts`)
- External API parsers/fallbacks (`src/lib/services/__tests__/external-apis.test.ts`)
- Dashboard data composition (`src/lib/services/__tests__/dashboard.test.ts`)
- Public home payload composition (`src/lib/services/__tests__/public-home.test.ts`)
