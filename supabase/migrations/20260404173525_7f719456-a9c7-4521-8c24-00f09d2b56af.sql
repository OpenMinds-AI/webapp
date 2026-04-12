
-- Create ventures table
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

ALTER TABLE public.ventures ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a venture brief
CREATE POLICY "Anyone can submit venture" ON public.ventures
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Admins can read all ventures
CREATE POLICY "Admins can read ventures" ON public.ventures
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Admins can update ventures
CREATE POLICY "Admins can update ventures" ON public.ventures
  FOR UPDATE TO authenticated USING (is_admin(auth.uid()));

-- Create partner_applications table
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

ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit partner application
CREATE POLICY "Anyone can submit partner application" ON public.partner_applications
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Admins can read all partner applications
CREATE POLICY "Admins can read partner applications" ON public.partner_applications
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Admins can update partner applications
CREATE POLICY "Admins can update partner applications" ON public.partner_applications
  FOR UPDATE TO authenticated USING (is_admin(auth.uid()));
