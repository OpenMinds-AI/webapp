---
name: App architecture
description: Portal structure, auth flow, Supabase schema, routing, and admin model
type: feature
---

## Auth
- Supabase Magic Link only. No passwords.
- AuthProvider wraps all routes inside BrowserRouter.
- After auth, new users land on /choose-path (Talents / Requests / Partners).
- Protected routes via ProtectedRoute component.

## Portals
- /onboarding/talent — 3-step: Profile → Availability → Review
- /onboarding/request — 4-step (TODO)
- /onboarding/partner — 6-step (TODO)
- /talents — The Grid (TODO)
- /admin — Dashboard (TODO)

## Supabase Schema
Tables: users, user_roles, talent_profiles, talent_skills, skills, requests, partners, badges
- Community code auto-assigned on approval via trigger (#0001+)
- RLS: own data editable, approved talents see approved grid, admin sees all
- has_role() security definer function prevents RLS recursion

## Admin
Three seats: Victoria / Jeremiah / Praj via user_roles table.
