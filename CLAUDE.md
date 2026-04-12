# OpenMinds AI — Project Guide

## Stack
- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion for all animations
- Supabase (external project, user-managed)
- React Router v6
- React Query

## Design System
- Dark theme only. Background `#000`, primary `#5B3FA6`, secondary `#7C6FE0`
- Space Grotesk for headings, DM Sans for body
- No logos — wordmark only
- Lucide icons only
- No passwords — Magic Link auth only
- Community codes start at `#0001`, never reset

## Auth
- Supabase Magic Link only. No passwords.
- `AuthProvider` wraps all routes inside `BrowserRouter`
- After auth, new users land on `/choose-path` (Talents / Requests / Partners)
- Protected routes via `ProtectedRoute` component

## Portals & Routing
- `/pre-join`, `/pre-ventures`, `/pre-partners` — public confirmation screens
- `/join` — Talent onboarding (3-step: Profile → Availability → Review)
- `/ventures` — Ventures onboarding (4-step form)
- `/partners` — Partners onboarding (4-step form)
- `/collective` — The Talent Grid
- `/admin` — Admin dashboard
- `/choose-path` — Post-auth portal selection

## Supabase Schema
Tables: `users`, `user_roles`, `talent_profiles`, `talent_skills`, `skills`, `requests`, `partners`, `badges`, `ventures`, `partner_applications`
- Community code auto-assigned on approval via trigger (`#0001+`)
- RLS: own data editable, approved talents see approved grid, admin sees all
- `has_role()` security definer function prevents RLS recursion
- Supabase client reads from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` env vars

## Admin
Three seats: Victoria / Jeremiah / Praj via `user_roles` table.

## Dev
```bash
npm run dev       # start dev server
npm run build     # production build
npm run test      # run tests
```
