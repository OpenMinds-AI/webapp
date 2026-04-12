

# Portal Selection, Pre-Entry Screens, Ventures & Partners Onboarding

## Overview

Add smooth-scroll CTA, portal selection section on homepage, three pre-entry confirmation screens, and full onboarding flows for Ventures and Partners with new Supabase tables.

## Database

### New table: `ventures`
```sql
CREATE TABLE public.ventures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  full_name text NOT NULL,
  email text NOT NULL,
  company_name text,
  intent_group text,
  sub_intents text[] DEFAULT '{}',
  description text,
  budget_range text,
  timeline text,
  referral_source text
);
```
RLS: anon+authenticated can INSERT, admins can SELECT/UPDATE.

### New table: `partner_applications`
The existing `partners` table is tied to authenticated users with a different schema. A new `partner_applications` table stores public onboarding submissions:
```sql
CREATE TABLE public.partner_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  full_name text NOT NULL,
  email text NOT NULL,
  company_name text NOT NULL,
  tool_description text,
  stage text,
  what_they_offer text[] DEFAULT '{}',
  offer_details text,
  what_they_want text[] DEFAULT '{}',
  goals text,
  referral_source text
);
```
RLS: anon+authenticated can INSERT, admins can SELECT/UPDATE.

## File Changes

### Modified files

**`src/components/Hero.tsx`** — "Request Access" button smooth-scrolls to `#get-started`.

**`src/components/Navbar.tsx`** — "Request Access" button smooth-scrolls to `#get-started`.

**`src/components/AudienceCards.tsx`** — Replace the existing section with the new portal selection design: add `id="get-started"`, update headline to "Who are you?", subline "Choose your path.", update card descriptions/CTAs per spec, add `useNavigate` to route card clicks to `/pre-join`, `/pre-ventures`, `/pre-partners`.

**`src/App.tsx`** — Add 5 new routes: `/pre-join`, `/pre-ventures`, `/pre-partners`, `/ventures`, `/partners` (all public, no auth).

**`src/integrations/supabase/types.ts`** — Add `ventures` and `partner_applications` type definitions.

### New files

**`src/pages/PreJoin.tsx`** — Confirmation screen for Talents. Lightning bolt icon, headline, body text, Continue button to `/join`, ghost Back button navigates to `/#get-started`.

**`src/pages/PreVentures.tsx`** — Same layout, compass icon, Continue to `/ventures`.

**`src/pages/PrePartners.tsx`** — Same layout, flame icon, Continue to `/partners`.

**`src/pages/VenturesOnboarding.tsx`** — 4-step form following JoinOnboarding patterns:
- Step 1: Intent selection (3 cards, single select)
- Step 2: Sub-intent pills (dynamic based on step 1) + description textarea
- Step 3: Contact fields (name, email, company, budget dropdown, timeline dropdown, referral dropdown)
- Step 4: Review summary + submit to `ventures` table

**`src/pages/PartnersOnboarding.tsx`** — 4-step form:
- Step 1: Contact + tool info (name, email, company, stage pills, tool description textarea)
- Step 2: What they offer (multi-select pills + details textarea)
- Step 3: What they want (multi-select pills + goals textarea)
- Step 4: Referral source + review summary + submit to `partner_applications` table

Both onboarding pages include: progress bar, step counter, slide transitions, loading states, success confirmation screen with checkmark animation, toast notifications.

## Email Triggers

The spec requests email notifications on venture/partner submissions. This requires connecting Resend (attempted earlier but not completed). Email setup will be addressed as a follow-up after the UI and database are built.

## Technical Details

- All new pages use the exact design tokens from the spec (colors, spacing, border-radius, font sizes)
- Pre-entry screens use framer-motion fade-in + translateY animation
- Onboarding forms mirror JoinOnboarding's patterns: AnimatePresence for step transitions, local state management, Supabase insert on submit
- Mobile responsive: cards stack vertically, max-width constraints, padding adjustments
- No existing files are structurally changed beyond the 4 listed above

