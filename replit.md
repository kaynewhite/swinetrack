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
- Local browser storage for auth (no backend yet)

## Project layout

```
src/
  main.tsx              # entry, BrowserRouter
  App.tsx               # routes (/, /login, /signup)
  index.css             # tailwind layers + HSL theme variables
  lib/
    auth.ts             # localStorage-backed signUp / signIn / session
  components/           # Navbar, Footer, Logo, AuthLayout
  pages/                # LandingPage, LoginPage, SignupPage
  assets/images/        # generated hero imagery
public/
  favicon.svg           # green-square pig glyph (matches dashboard wordmark)
swinetrack/             # reference dashboard screenshots (read-only)
```

## Authentication (local, demo only)

Auth lives entirely in the browser via `src/lib/auth.ts`. Accounts and the
active session are stored in `localStorage` — no backend, no API keys, no
external services.

Public API:

- `signUp({ fullName, email, password, accountType })` → `SessionUser`
- `signIn({ email, password })` → `SessionUser`
- `signOut()`
- `getCurrentUser()` → `SessionUser | null`

Storage keys:

- `swinetrack.accounts.v1` — array of `StoredAccount` records
- `swinetrack.session.v1` — currently signed-in user

This is **for the capstone demo only** — passwords are stored as a fast
non-cryptographic hash and accounts only exist in the current browser.
Replace with a real auth provider (Supabase, Replit Auth, custom backend +
Postgres + bcrypt) before any production use.

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
