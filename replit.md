# SwineTrack — Web

Public-facing web pages for **SwineTrack: A Web and Mobile-Based Farm-to-Market
Swine Traceability System with Predictive and Prescriptive Analytics** (capstone
project, Laguna Province pilot).

## Scope (current build)

Three pages, no backend of our own — Supabase handles auth.

- `/`        — marketing landing page
- `/login`   — sign in (email + password, "Continue with Google")
- `/signup`  — register (full name, email, password, account type, Google OAuth)

The internal MAO/PAO dashboards shown in `swinetrack/mao/*.png` and
`swinetrack/pao/*.png` are reference material only — they are NOT implemented in
this repo yet.

## Stack

- **Vite 5** + **React 18** + **TypeScript**
- **Tailwind CSS 3** with shadcn-style HSL CSS variables (see
  `src/index.css` + `tailwind.config.js`)
- **react-router-dom 6** for routing
- **framer-motion** for scroll/entrance animations on the landing page
- **lucide-react** for icons (no emojis used in the UI, by design)
- **@supabase/supabase-js** for authentication

## Project layout

```
src/
  main.tsx              # entry, BrowserRouter
  App.tsx               # routes (/, /login, /signup)
  index.css             # tailwind layers + HSL theme variables
  lib/
    supabase.ts         # supabase client + isSupabaseConfigured flag
  components/           # Navbar, Footer, Logo, AuthLayout
  pages/                # LandingPage, LoginPage, SignupPage
  assets/images/        # generated hero imagery
public/
  favicon.svg           # green-square pig glyph (matches dashboard wordmark)
swinetrack/             # reference dashboard screenshots (read-only)
```

## Authentication

`src/lib/supabase.ts` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
from Vite env. If either is missing, `isSupabaseConfigured` is `false` and the
auth pages render an inline "Authentication is being configured" notice instead
of crashing.

Auth calls used by the pages:

- `supabase.auth.signInWithPassword({ email, password })`
- `supabase.auth.signUp({ email, password, options: { data: { full_name, account_type }, emailRedirectTo } })`
- `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })`

For Google OAuth to work, the Google provider must be enabled in the Supabase
dashboard: **Authentication → Providers → Google**, and the Replit dev domain
must be added to the allowed redirect URLs.

## Dev / Replit setup

- Workflow `Start application` runs `npm run dev` on port **5000**.
- `vite.config.ts` binds to `0.0.0.0:5000` with `allowedHosts: true` so the
  Replit iframe proxy can serve the app.
- HMR uses `wss://` on port 443 to work through the Replit HTTPS proxy.

## Brand notes

- Primary color: agriculture green `#16a34a` (`brand-600`).
- Wordmark: pig glyph + "SwineTrack" — matches the green nav bar in the
  reference dashboards.
- Display type: **Plus Jakarta Sans**. Body type: **Inter**. Both loaded from
  Google Fonts in `index.html`.
- No emojis in UI — use `lucide-react` icons.
