# FoundHer

FoundHer helps women in tech at universities find mentors, study partners, hackathon teammates, and peers who share their background matched to what they're actually looking for, not just who they already know.

## Tech stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (auth + database)
- Google Gemini (AI-powered matching, with a keyword-based fallback if it's unavailable)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root with:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   GEMINI_API_KEY=your-gemini-api-key
   ```

   Get the Supabase values from your project's **Settings > API** page. Without these, the app still runs, but auth, real profiles, and AI matching are disabled.

3. Set up the database: open the Supabase SQL Editor and run everything in [`supabase/schema.sql`](supabase/schema.sql). If you're pulling in a newer feature, check the `supabase/migrations/` folder for anything you need to run separately.

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `src/app/` — pages (Discover, onboarding, profile, connections, messages, events, account)
- `src/components/` — shared UI components
- `src/lib/` — matching logic, Supabase clients, and shared types
- `src/data/` — mock/demo profiles used alongside real signed-up users
- `supabase/schema.sql` — full database schema and RLS policies

## Other commands

```bash
npm run build   # production build
npm run start   # run a production build
npm run lint    # lint the codebase
```
